import type { BO3Match } from '../utils/bo3.types'
import type { Payload } from 'payload'

export const BO3_SYNC_JOB_NAME = 'bo3-sync-matches'
export const BO3_SYNC_TASK_SLUG = 'bo3SyncMatches'
const lastEnqueueByKey = new Map<string, number>()

export type QueueLike = {
  add: (
    name: string,
    payload: BO3SyncJobPayload,
    options: Record<string, unknown>,
  ) => Promise<unknown>
}

export type PayloadLike = {
  find: (args: Record<string, unknown>) => Promise<{ docs?: Array<Record<string, unknown>> }>
  create: (args: Record<string, unknown>) => Promise<unknown>
  update: (args: Record<string, unknown>) => Promise<unknown>
}

export type BO3SyncJobPayload = {
  requestedBy: 'manual' | 'cron' | string
  date?: string
  mode?: 'live-priority' | 'full' | 'date-only'
  batchSize?: number
  concurrency?: number
}

function mapMatchToPayload(match: BO3Match): Record<string, unknown> {
  return {
    externalMatchId: String(match.id),
    id: String(match.id),
    status: match.status,
    date: match.start_date,
    time: new Date(match.start_date).toISOString(),
    format: `bo${match.bo_type || 3}`,
    finalScore: {
      team1: match.team1_score ?? 0,
      team2: match.team2_score ?? 0,
    },
    team1ExternalId: match.team1_id,
    team2ExternalId: match.team2_id,
    tournamentExternalId: match.tournament_id,
    raw: match,
    lastSyncedAt: new Date().toISOString(),
  }
}

export async function enqueueBO3SyncJob({
  queue,
  payload,
}: {
  queue: QueueLike
  payload: BO3SyncJobPayload
}): Promise<void> {
  await queue.add(BO3_SYNC_JOB_NAME, payload, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1_000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  })
}

export async function upsertBO3Match({
  payloadClient,
  match,
  logger = console,
}: {
  payloadClient: PayloadLike
  match: BO3Match
  logger?: Pick<Console, 'info' | 'error'>
}): Promise<void> {
  const externalMatchId = String(match.id)

  const existing = await payloadClient.find({
    collection: 'matches',
    where: {
      externalMatchId: {
        equals: externalMatchId,
      },
    },
    limit: 1,
  })

  const data = mapMatchToPayload(match)
  const doc = existing.docs?.[0]

  if (doc?.id) {
    await payloadClient.update({
      collection: 'matches',
      id: doc.id,
      data,
    })
    logger.info?.(`[bo3-sync] updated match ${externalMatchId}`)
    return
  }

  await payloadClient.create({
    collection: 'matches',
    data,
  })
  logger.info?.(`[bo3-sync] created match ${externalMatchId}`)
}

export async function processBO3SyncJob({
  payloadClient,
  fetchMatches,
  job,
  logger = console,
}: {
  payloadClient: PayloadLike
  fetchMatches: (date?: string) => Promise<BO3Match[]>
  job: { date?: string }
  logger?: Pick<Console, 'info' | 'error'>
}): Promise<{ processed: number; failed: number }> {
  const matches = await fetchMatches(job.date)

  if (!Array.isArray(matches) || matches.length === 0) {
    logger.info?.('[bo3-sync] no matches to process')
    return { processed: 0, failed: 0 }
  }

  const results = await Promise.allSettled(
    matches.map((match) =>
      upsertBO3Match({
        payloadClient,
        match,
        logger,
      }),
    ),
  )

  const failed = results.filter((result) => result.status === 'rejected').length
  const processed = results.length - failed

  if (failed > 0) {
    logger.error?.(`[bo3-sync] processed with failures: ${processed} success / ${failed} failed`)
  } else {
    logger.info?.(`[bo3-sync] processed ${processed} matches successfully`)
  }

  return { processed, failed }
}

export async function enqueuePayloadBO3SyncTask({
  payload,
  input,
  queue,
}: {
  payload: Payload
  input: {
    requestedBy?: string
    date?: string
    mode?: 'live-priority' | 'full' | 'date-only'
    batchSize?: number
    concurrency?: number
  }
  queue?: string
}): Promise<void> {
  const dedupWindowMs = Number(process.env.BO3_SYNC_ENQUEUE_DEDUP_MS || 30_000)
  const dedupKey = `${queue || 'default'}:${input.mode || 'full'}:${input.date || 'none'}`
  const now = Date.now()
  const lastQueuedAt = lastEnqueueByKey.get(dedupKey)

  if (typeof lastQueuedAt === 'number' && now - lastQueuedAt < dedupWindowMs) {
    payload.logger.info(
      `[bo3-sync] enqueue skipped by dedup window key=${dedupKey} windowMs=${dedupWindowMs}`,
    )
    return
  }

  await payload.jobs.queue({
    task: BO3_SYNC_TASK_SLUG as never,
    input: {
      requestedBy: input.requestedBy || 'manual',
      date: input.date,
      mode: input.mode,
      batchSize: input.batchSize,
      concurrency: input.concurrency,
    } as never,
    queue,
  })

  lastEnqueueByKey.set(dedupKey, now)
}
