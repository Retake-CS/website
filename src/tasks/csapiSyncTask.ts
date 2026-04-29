import { TaskConfig } from 'payload'
import { performCSAPISync } from '../utils/csapi.sync'

export const csapiSyncTask: TaskConfig<any> = {
  slug: 'csapiSync',
  handler: async ({ req }) => {
    const { payload } = req
    try {
      await performCSAPISync(payload)
      return {
        output: {},
        state: 'succeeded',
      }
    } catch (error: any) {
      payload.logger.error(`CSAPI Sync Task failed: ${error.message}`)
      return {
        state: 'failed',
      }
    }
  },
  schedule: [
    {
      cron: '*/30 * * * *', // Every 30 minutes (5-field standard Unix cron)
      queue: 'default',
    },
  ],
}
