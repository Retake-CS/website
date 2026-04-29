import { enqueuePayloadBO3SyncTask } from '@/scripts/bo3-sync.queue'

const bo3SyncTriggerEndpoint = {
  path: '/bo3-sync/trigger',
  method: 'post',
  handler: async (req: any, res: any) => {
    try {
      const authHeader = req.headers.authorization || req.headers.get?.('authorization')
      const expectedToken = process.env.CRON_SECRET
        ? `Bearer ${process.env.CRON_SECRET}`
        : undefined

      const isAuthorized = Boolean(req.user) || (expectedToken && authHeader === expectedToken)

      if (!isAuthorized) {
        return res.status(401).json({
          error: 'Unauthorized',
        })
      }

      const body = (req.body || {}) as {
        date?: string
        mode?: 'live-priority' | 'full' | 'date-only'
        batchSize?: number
        concurrency?: number
      }

      await enqueuePayloadBO3SyncTask({
        payload: req.payload,
        input: {
          requestedBy: req.user ? 'admin-user' : 'api-trigger',
          date: body.date,
          mode: body.mode,
          batchSize: body.batchSize,
          concurrency: body.concurrency,
        },
      })

      return res.status(202).json({
        status: 'queued',
      })
    } catch (error) {
      req.payload.logger.error('[bo3-sync] trigger endpoint failed', error)
      return res.status(500).json({
        error: 'Failed to enqueue BO3 sync task',
      })
    }
  },
}

export default bo3SyncTriggerEndpoint
