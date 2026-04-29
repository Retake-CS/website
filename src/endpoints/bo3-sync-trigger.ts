import { Endpoint } from 'payload'
import { enqueuePayloadBO3SyncTask } from '@/scripts/bo3-sync.queue'

const bo3SyncTriggerEndpoint: Endpoint = {
  path: '/bo3-sync/trigger',
  method: 'post',
  handler: async (req) => {
    try {
      const authHeader = req.headers.get('authorization')
      const expectedToken = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : undefined

      const isAuthorized = Boolean(req.user) || (expectedToken && authHeader === expectedToken)

      if (!isAuthorized) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      let body: any = {}
      if (req.json) {
        try {
          body = await req.json()
        } catch (e) {
          // Fallback for empty body
        }
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

      return Response.json({ status: 'queued' }, { status: 202 })
    } catch (error) {
      req.payload.logger.error('[bo3-sync] trigger endpoint failed', error)
      return Response.json({ error: 'Failed to enqueue BO3 sync task' }, { status: 500 })
    }
  },
}

export default bo3SyncTriggerEndpoint
