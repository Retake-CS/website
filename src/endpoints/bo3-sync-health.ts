import { Endpoint } from 'payload/config'

import { getBO3SyncHealth } from '@/scripts/bo3-sync.service'

const bo3SyncHealthEndpoint: Endpoint = {
  path: '/bo3-sync/health',
  method: 'get',
  handler: async (req, res) => {
    try {
      const liveThreshold = req.query.liveStaleMinutes
      const runThreshold = req.query.runStaleMinutes

      const report = await getBO3SyncHealth({
        payload: req.payload,
        liveStaleThresholdMinutes:
          typeof liveThreshold === 'string' ? Number(liveThreshold) : undefined,
        runStaleThresholdMinutes:
          typeof runThreshold === 'string' ? Number(runThreshold) : undefined,
      })

      const statusCode =
        report.status === 'healthy' ? 200 : report.status === 'degraded' ? 206 : 503
      return res.status(statusCode).json(report)
    } catch (error) {
      req.payload.logger.error('[bo3-sync] health endpoint failed', error)
      return res.status(500).json({
        error: 'Failed to compute bo3 sync health',
      })
    }
  },
}

export default bo3SyncHealthEndpoint
