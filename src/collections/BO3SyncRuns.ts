import type { CollectionConfig } from 'payload'

const BO3SyncRuns: CollectionConfig = {
  slug: 'bo3-sync-runs',
  admin: {
    useAsTitle: 'startedAt',
    defaultColumns: ['startedAt', 'mode', 'date', 'fetched', 'processed', 'failed'],
    group: 'CS2',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'mode',
      type: 'select',
      required: true,
      options: [
        { label: 'Live Priority', value: 'live-priority' },
        { label: 'Full', value: 'full' },
        { label: 'Date Only', value: 'date-only' },
      ],
      index: true,
    },
    {
      name: 'date',
      type: 'text',
      index: true,
    },
    {
      name: 'startedAt',
      type: 'date',
      required: true,
      index: true,
    },
    {
      name: 'finishedAt',
      type: 'date',
      required: true,
      index: true,
    },
    {
      name: 'durationMs',
      type: 'number',
      required: true,
    },
    {
      name: 'fetched',
      type: 'number',
      required: true,
    },
    {
      name: 'processed',
      type: 'number',
      required: true,
    },
    {
      name: 'created',
      type: 'number',
      required: true,
    },
    {
      name: 'updated',
      type: 'number',
      required: true,
    },
    {
      name: 'failed',
      type: 'number',
      required: true,
    },
    {
      name: 'endpointBreakdown',
      type: 'json',
    },
    {
      name: 'endpointMetrics',
      type: 'array',
      fields: [
        {
          name: 'endpoint',
          type: 'text',
          required: true,
        },
        {
          name: 'status',
          type: 'text',
          required: true,
        },
        {
          name: 'fetchedCount',
          type: 'number',
          required: true,
        },
        {
          name: 'durationMs',
          type: 'number',
          required: true,
        },
        {
          name: 'retryCount',
          type: 'number',
          required: true,
        },
        {
          name: 'circuitOpen',
          type: 'checkbox',
        },
        {
          name: 'errorMessage',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'errorMessage',
      type: 'textarea',
    },
  ],
}

export default BO3SyncRuns
