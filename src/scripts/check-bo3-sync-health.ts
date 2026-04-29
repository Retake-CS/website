import { getPayload } from 'payload'

import config from '@/payload.config'
import { getBO3SyncHealth } from './bo3-sync.service'

async function main() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const report = await getBO3SyncHealth({ payload })
  payload.logger.info('[bo3-sync] health report')
  payload.logger.info(report)
}

main().catch((error) => {
  console.error('[bo3-sync] health check failed', error)
  process.exit(1)
})
