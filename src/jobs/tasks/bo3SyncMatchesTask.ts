import type { TaskConfig } from 'payload'

import { type BO3SyncMode, syncBO3MatchesToPayload } from '@/scripts/bo3-sync.service'

export const bo3SyncMatchesTask: TaskConfig = {
  slug: 'bo3SyncMatches',
  label: 'BO3 sync matches',
  retries: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1_000,
    },
  },
  inputSchema: [
    {
      name: 'requestedBy',
      type: 'text',
      required: false,
    },
    {
      name: 'date',
      type: 'text',
      required: false,
    },
    {
      name: 'batchSize',
      type: 'number',
      required: false,
    },
    {
      name: 'concurrency',
      type: 'number',
      required: false,
    },
    {
      name: 'mode',
      type: 'text',
      required: false,
    },
  ],
  schedule: [
    {
      cron: '0 * * * * *',
      queue: 'bo3-live',
      hooks: {
        beforeSchedule: async () => {
          return {
            shouldSchedule: true,
            input: {
              requestedBy: 'scheduler-live',
              mode: 'live-priority',
              batchSize: 120,
              concurrency: 8,
            },
          }
        },
      },
    },
    {
      cron: '0 */15 * * * *',
      queue: 'bo3-default',
      hooks: {
        beforeSchedule: async () => {
          return {
            shouldSchedule: true,
            input: {
              requestedBy: 'scheduler-full',
              mode: 'full',
              batchSize: 180,
              concurrency: 4,
            },
          }
        },
      },
    },
    {
      cron: '0 */20 * * * *',
      queue: 'bo3-default',
      hooks: {
        beforeSchedule: async () => {
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

          return {
            shouldSchedule: true,
            input: {
              requestedBy: 'scheduler-deep-backfill',
              mode: 'date-only',
              date: yesterday,
              batchSize: 220,
              concurrency: 3,
            },
          }
        },
      },
    },
  ],
  handler: async ({ input, req }) => {
    const parsedInput = (input ?? {}) as {
      requestedBy?: string
      date?: string
      batchSize?: number
      concurrency?: number
      mode?: BO3SyncMode
    }

    const payload = req.payload
    const mode: BO3SyncMode | undefined =
      parsedInput.mode === 'live-priority' ||
      parsedInput.mode === 'full' ||
      parsedInput.mode === 'date-only'
        ? parsedInput.mode
        : undefined

    const summary = await syncBO3MatchesToPayload({
      payload,
      date: typeof parsedInput.date === 'string' ? parsedInput.date : undefined,
      mode,
      batchSize: typeof parsedInput.batchSize === 'number' ? parsedInput.batchSize : 200,
      concurrency: typeof parsedInput.concurrency === 'number' ? parsedInput.concurrency : 4,
      logger: payload.logger,
    })

    return {
      output: {
        ...summary,
        requestedBy:
          typeof parsedInput.requestedBy === 'string' ? parsedInput.requestedBy : 'unknown',
      },
      state: 'succeeded',
    }
  },
}
