import { getPayload } from 'payload'

import config from '@/payload.config'
import { enqueuePayloadBO3SyncTask } from './bo3-sync.queue'

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

async function main() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  await enqueuePayloadBO3SyncTask({
    payload,
    input: {
      requestedBy: process.env.BO3_SYNC_REQUESTED_BY || 'manual-script',
      date: process.env.BO3_SYNC_DATE,
      mode:
        process.env.BO3_SYNC_MODE === 'live-priority' ||
        process.env.BO3_SYNC_MODE === 'full' ||
        process.env.BO3_SYNC_MODE === 'date-only'
          ? process.env.BO3_SYNC_MODE
          : undefined,
      batchSize: parseNumber(process.env.BO3_SYNC_BATCH_SIZE, 200),
      concurrency: parseNumber(process.env.BO3_SYNC_CONCURRENCY, 4),
    },
  })

  payload.logger.info('[bo3-sync] job queued successfully')
}

main().catch((error) => {
  console.error('[bo3-sync] queue script failed', error)
  process.exit(1)
})
