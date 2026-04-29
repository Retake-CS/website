import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  BO3_SYNC_JOB_NAME,
  enqueueBO3SyncJob,
  processBO3SyncJob,
  upsertBO3Match,
} from './bo3-sync.queue'

const sampleApiMatches = [
  {
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
    team1: { id: 10, name: 'NAVI', slug: 'navi' },
    team2: { id: 20, name: 'FaZe', slug: 'faze' },
    tournament: { id: 300, name: 'IEM Major', slug: 'iem-major', status: 'ongoing', tier: 's' },
  },
]

describe('BO3 sync queue (TDD - etapa inicial)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve inserir job na fila com retries e exponential backoff', async () => {
    const queue = {
      add: vi.fn().mockResolvedValue({ id: 'job-1' }),
    }

    await enqueueBO3SyncJob({
      queue,
      payload: {
        requestedBy: 'manual',
        date: '2026-04-04',
      },
    })

    expect(queue.add).toHaveBeenCalledTimes(1)
    expect(queue.add).toHaveBeenCalledWith(
      BO3_SYNC_JOB_NAME,
      {
        requestedBy: 'manual',
        date: '2026-04-04',
      },
      expect.objectContaining({
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1_000,
        },
      }),
    )
  })

  it('worker deve consumir mock da API e executar upsert sem duplicar', async () => {
    const payloadClient = {
      find: vi
        .fn()
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [{ id: 'payload-match-1', externalMatchId: '9001' }] }),
      create: vi.fn().mockResolvedValue({ id: 'payload-match-1' }),
      update: vi.fn().mockResolvedValue({ id: 'payload-match-1' }),
    }

    const fetchMatches = vi
      .fn()
      .mockResolvedValueOnce(sampleApiMatches)
      .mockResolvedValueOnce([
        {
          ...sampleApiMatches[0],
          status: 'finished',
          team1_score: 2,
          team2_score: 1,
        },
      ])

    await processBO3SyncJob({
      payloadClient,
      fetchMatches,
      job: {
        date: '2026-04-04',
      },
    })

    await processBO3SyncJob({
      payloadClient,
      fetchMatches,
      job: {
        date: '2026-04-04',
      },
    })

    expect(fetchMatches).toHaveBeenCalledTimes(2)

    // 1a execução: cria
    expect(payloadClient.create).toHaveBeenCalledTimes(1)
    expect(payloadClient.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'matches',
        data: expect.objectContaining({
          externalMatchId: '9001',
          status: 'upcoming',
        }),
      }),
    )

    // 2a execução: atualiza (upsert sem duplicar)
    expect(payloadClient.update).toHaveBeenCalledTimes(1)
    expect(payloadClient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'matches',
        id: 'payload-match-1',
        data: expect.objectContaining({
          status: 'finished',
          finalScore: {
            team1: 2,
            team2: 1,
          },
        }),
      }),
    )
  })

  it('upsert isolado deve criar quando não existir e atualizar quando existir', async () => {
    const payloadClient = {
      find: vi
        .fn()
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [{ id: 'm1', externalMatchId: '9001' }] }),
      create: vi.fn().mockResolvedValue({ id: 'm1' }),
      update: vi.fn().mockResolvedValue({ id: 'm1' }),
    }

    await upsertBO3Match({ payloadClient, match: sampleApiMatches[0] as any })
    await upsertBO3Match({
      payloadClient,
      match: {
        ...sampleApiMatches[0],
        status: 'live',
        team1_score: 1,
        team2_score: 0,
      } as any,
    })

    expect(payloadClient.create).toHaveBeenCalledTimes(1)
    expect(payloadClient.update).toHaveBeenCalledTimes(1)
  })
})
