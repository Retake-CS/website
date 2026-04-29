import { getPayload } from 'payload'

import config from '@/payload.config'

async function main() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const result = await payload.jobs.run({
    allQueues: true,
    limit: Number(process.env.BO3_SYNC_RUN_LIMIT || 50),
  })

  payload.logger.info('[bo3-sync] worker run completed')
  payload.logger.info(result)
}

main().catch((error) => {
  console.error('[bo3-sync] worker script failed', error)
  process.exit(1)
})
