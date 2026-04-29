import { Endpoint } from 'payload'

import { getBO3SyncHealth } from '@/scripts/bo3-sync.service'

const bo3SyncHealthEndpoint: Endpoint = {
  path: '/bo3-sync/health',
  method: 'get',
  handler: async (req) => {
    try {
      if (!req.url) {
        return Response.json({ error: 'Request URL is missing' }, { status: 400 })
      }
      const url = new URL(req.url)
      const liveThreshold = url.searchParams.get('liveStaleMinutes')
      const runThreshold = url.searchParams.get('runStaleMinutes')

      const report = await getBO3SyncHealth({
        payload: req.payload,
        liveStaleThresholdMinutes: liveThreshold ? Number(liveThreshold) : undefined,
        runStaleThresholdMinutes: runThreshold ? Number(runThreshold) : undefined,
      })

      const statusCode = report.status === 'healthy' ? 200 : report.status === 'degraded' ? 206 : 503
      return Response.json(report, { status: statusCode })
    } catch (error) {
      req.payload.logger.error('[bo3-sync] health endpoint failed', error)
      return Response.json({ error: 'Failed to compute bo3 sync health' }, { status: 500 })
    }
  },
}

export default bo3SyncHealthEndpoint
