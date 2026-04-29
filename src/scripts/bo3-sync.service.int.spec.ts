import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchBO3MatchesByMode,
  getBO3SyncHealth,
  resetBO3EndpointCircuitStateForTests,
  syncBO3MatchesToPayload,
  upsertMatchByExternalId,
  withExponentialRetry,
} from './bo3-sync.service'

const sampleMatch = {
  id: 9001,
  slug: 'navi-vs-faze',
  status: 'upcoming',
  tier: 's',
  team1_id: 10,
  team2_id: 20,
  team1_score: 0,
  team2_score: 0,
  bo_type: 3,
  start_date: '2026-04-04T18:00:00.000Z',
  tournament_id: 300,
  discipline_id: 1,
}

describe('BO3 sync service', () => {
  beforeEach(() => {
    resetBO3EndpointCircuitStateForTests()
  })

  it('deve processar lotes sem travar e consolidar resumo', async () => {
    const payload = {} as any

    const fetchMatches = vi.fn().mockResolvedValue([sampleMatch, { ...sampleMatch, id: 9002 }])
    const upsertMatch = vi.fn().mockResolvedValueOnce('created').mockResolvedValueOnce('updated')

    const summary = await syncBO3MatchesToPayload({
      payload,
      fetchMatches,
      upsertMatch,
      logger: console,
      concurrency: 2,
      batchSize: 100,
      upsertRetryAttempts: 2,
      upsertRetryBaseDelayMs: 1,
    })

    expect(summary).toEqual({
      fetched: 2,
      processed: 2,
      created: 1,
      updated: 1,
      failed: 0,
      mode: 'full',
      endpointBreakdown: {
        live: 0,
        upcoming: 0,
        finished_recent: 0,
        date_only: 0,
      },
      endpointMetrics: [],
    })
  })

  it('deve isolar falhas sem derrubar o processamento', async () => {
    const payload = {} as any

    const fetchMatches = vi.fn().mockResolvedValue([sampleMatch, { ...sampleMatch, id: 9002 }])
    const upsertMatch = vi
      .fn()
      .mockResolvedValueOnce('created')
      .mockRejectedValue(new Error('rate limit'))

    const summary = await syncBO3MatchesToPayload({
      payload,
      fetchMatches,
      upsertMatch,
      logger: console,
      concurrency: 2,
      batchSize: 100,
      upsertRetryAttempts: 2,
      upsertRetryBaseDelayMs: 1,
    })

    expect(summary.fetched).toBe(2)
    expect(summary.processed).toBe(1)
    expect(summary.failed).toBe(1)
    expect(summary.mode).toBe('full')
    expect(summary.endpointMetrics).toEqual([])
  })

  it('deve priorizar partidas live quando modo for live-priority', async () => {
    const response = await fetchBO3MatchesByMode({
      mode: 'live-priority',
      fetchers: {
        live: async () => [
          {
            ...sampleMatch,
            id: 3,
            status: 'live',
          } as any,
          {
            ...sampleMatch,
            id: 1,
            status: 'live',
          } as any,
        ],
        upcoming: async () => [
          {
            ...sampleMatch,
            id: 2,
            status: 'upcoming',
          } as any,
        ],
        finishedRecent: async () => [
          {
            ...sampleMatch,
            id: 4,
            status: 'finished',
          } as any,
        ],
        byDate: async () => [],
      },
      logger: console,
    })

    expect(response.matches.map((match) => match.status)).toEqual([
      'live',
      'live',
      'upcoming',
      'finished',
    ])

    expect(response.endpointBreakdown.live).toBe(2)
    expect(response.endpointBreakdown.upcoming).toBe(1)
    expect(response.endpointBreakdown.finished_recent).toBe(1)
    expect(response.endpointMetrics).toHaveLength(3)
  })

  it('deve abrir circuit breaker e pular endpoint após falhas consecutivas', async () => {
    const alwaysFail = vi.fn().mockRejectedValue(new Error('api down'))

    await fetchBO3MatchesByMode({
      mode: 'full',
      endpointRetryAttempts: 1,
      endpointRetryBaseDelayMs: 1,
      fetchers: {
        live: alwaysFail,
        upcoming: async () => [],
        finishedRecent: async () => [],
        byDate: async () => [],
      },
      logger: console,
    })

    await fetchBO3MatchesByMode({
      mode: 'full',
      endpointRetryAttempts: 1,
      endpointRetryBaseDelayMs: 1,
      fetchers: {
        live: alwaysFail,
        upcoming: async () => [],
        finishedRecent: async () => [],
        byDate: async () => [],
      },
      logger: console,
    })

    await fetchBO3MatchesByMode({
      mode: 'full',
      endpointRetryAttempts: 1,
      endpointRetryBaseDelayMs: 1,
      fetchers: {
        live: alwaysFail,
        upcoming: async () => [],
        finishedRecent: async () => [],
        byDate: async () => [],
      },
      logger: console,
    })

    const fourth = await fetchBO3MatchesByMode({
      mode: 'full',
      endpointRetryAttempts: 1,
      endpointRetryBaseDelayMs: 1,
      fetchers: {
        live: alwaysFail,
        upcoming: async () => [],
        finishedRecent: async () => [],
        byDate: async () => [],
      },
      logger: console,
    })

    const liveMetric = fourth.endpointMetrics.find((metric) => metric.endpoint === 'live')
    expect(liveMetric?.status).toBe('skipped_circuit_open')
    expect(alwaysFail).toHaveBeenCalled()
  })

  it('deve persistir métricas da execução quando payload.create estiver disponível', async () => {
    const payload = {
      create: vi.fn().mockResolvedValue({ id: 'run-1' }),
    } as any

    const summary = await syncBO3MatchesToPayload({
      payload,
      fetchMatches: vi.fn().mockResolvedValue([sampleMatch]),
      upsertMatch: vi.fn().mockResolvedValue('created'),
      logger: console,
    })

    expect(summary.processed).toBe(1)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'bo3-sync-runs',
        data: expect.objectContaining({
          fetched: 1,
          processed: 1,
          created: 1,
          failed: 0,
        }),
      }),
    )
  })

  it('deve registrar transição de status e metadados de qualidade no upsert', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            id: 'm1',
            bo3Status: 'upcoming',
            statusTransitions: [{ toStatus: 'upcoming', changedAt: '2026-04-01T00:00:00.000Z' }],
            syncMeta: {
              firstSeenAt: '2026-04-01T00:00:00.000Z',
            },
          },
        ],
      }),
      create: vi.fn().mockResolvedValue({ id: 't1' }),
      update: vi.fn().mockResolvedValue({ id: 'm1' }),
    } as any

    await upsertMatchByExternalId({
      payload,
      match: {
        ...sampleMatch,
        status: 'live',
        games: [
          {
            map_name: 'inferno',
            status: 'live',
            winner_clan_score: 8,
            loser_clan_score: 7,
          },
        ],
      } as any,
      logger: console,
    })

    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusTransitions: expect.arrayContaining([
            expect.objectContaining({
              fromStatus: 'upcoming',
              toStatus: 'live',
            }),
          ]),
          maps: expect.arrayContaining([
            expect.objectContaining({
              mapName: 'inferno',
            }),
          ]),
          syncMeta: expect.objectContaining({
            dataCompletenessScore: expect.any(Number),
          }),
        }),
      }),
    )
  })

  it('deve gerar health report com status degraded quando live está stale', async () => {
    const payload = {
      find: vi
        .fn()
        .mockResolvedValueOnce({
          docs: [
            {
              id: 'm1',
              status: 'live',
              lastSyncedAt: '2026-04-01T00:00:00.000Z',
            },
          ],
        })
        .mockResolvedValueOnce({
          docs: [
            {
              startedAt: new Date().toISOString(),
              finishedAt: new Date().toISOString(),
              failed: 0,
              mode: 'live-priority',
            },
          ],
        }),
    } as any

    const report = await getBO3SyncHealth({
      payload,
      liveStaleThresholdMinutes: 1,
      runStaleThresholdMinutes: 60,
    })

    expect(report.status).toBe('degraded')
    expect(report.live.stale).toBe(1)
  })

  it('deve aplicar retry exponencial', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error('temporary 1'))
      .mockRejectedValueOnce(new Error('temporary 2'))
      .mockResolvedValueOnce('ok')

    const result = await withExponentialRetry(operation, {
      attempts: 4,
      baseDelayMs: 1,
      logger: console,
      operationName: 'retry-test',
    })

    expect(result).toBe('ok')
    expect(operation).toHaveBeenCalledTimes(3)
  })

  it('deve aceitar dados incompletos para live/upcoming e preencher fallback', async () => {
    const create = vi.fn(async ({ collection, data }: any) => ({
      id: `${collection}-1`,
      ...data,
    }))

    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      create,
      update: vi.fn(),
    } as any

    await upsertMatchByExternalId({
      payload,
      match: {
        ...sampleMatch,
        status: 'upcoming',
        team1: { id: 10, name: '', acronym: '' },
        team2: { id: 20, name: '', acronym: '' },
        tournament: { id: 300, name: '', slug: '' },
      } as any,
      logger: console,
    })

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'teams',
        data: expect.objectContaining({
          name: 'Unknown Team 10',
        }),
      }),
    )

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'tournaments',
        data: expect.objectContaining({
          name: 'Unknown Tournament 300',
        }),
      }),
    )
  })

  it('deve fazer lazy-skip quando match não mudou e sync recente', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            id: 'm1',
            bo3Status: 'upcoming',
            lastSyncedAt: new Date().toISOString(),
            syncMeta: {
              dataCompletenessScore: 95,
            },
          },
        ],
      }),
      create: vi.fn(),
      update: vi.fn(),
    } as any

    const action = await upsertMatchByExternalId({
      payload,
      match: {
        ...sampleMatch,
        status: 'upcoming',
      } as any,
      logger: console,
    })

    expect(action).toBe('updated')
    expect(payload.create).not.toHaveBeenCalled()
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('deve pular execução quando existe run recente no cooldown', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
            mode: 'full',
          },
        ],
      }),
    } as any

    const summary = await syncBO3MatchesToPayload({
      payload,
      mode: 'full',
      logger: console,
    })

    expect(summary.fetched).toBe(0)
    expect(summary.processed).toBe(0)
    expect(summary.failed).toBe(0)
  })
})
