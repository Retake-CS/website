import type { CollectionConfig } from 'payload'

const Matches: CollectionConfig = {
  slug: 'matches',
  admin: {
    useAsTitle: 'externalMatchId',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'externalMatchId',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'id',
      type: 'text',
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Completed', value: 'completed' },
        { label: 'Live', value: 'live' },
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Postponed', value: 'postponed' },
      ],
      defaultValue: 'upcoming',
    },
    {
      name: 'bo3Status',
      type: 'text',
      index: true,
    },
    {
      name: 'tier',
      type: 'text',
      index: true,
    },
    {
      name: 'disciplineId',
      type: 'number',
      index: true,
    },
    {
      name: 'date',
      type: 'date',
    },
    {
      name: 'startDate',
      type: 'date',
      index: true,
    },
    {
      name: 'endDate',
      type: 'date',
    },
    {
      name: 'time',
      type: 'text',
    },
    {
      name: 'format',
      type: 'text',
    },
    {
      name: 'finalScore',
      type: 'group',
      fields: [
        {
          name: 'team1',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'team2',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'team1',
      type: 'relationship',
      relationTo: 'teams',
    },
    {
      name: 'team2',
      type: 'relationship',
      relationTo: 'teams',
    },
    {
      name: 'tournament',
      type: 'relationship',
      relationTo: 'tournaments',
    },
    {
      name: 'team1Name',
      type: 'text',
    },
    {
      name: 'team2Name',
      type: 'text',
    },
    {
      name: 'tournamentName',
      type: 'text',
    },
    {
      name: 'team1ExternalId',
      type: 'number',
      index: true,
    },
    {
      name: 'team2ExternalId',
      type: 'number',
      index: true,
    },
    {
      name: 'tournamentExternalId',
      type: 'number',
      index: true,
    },
    {
      name: 'raw',
      type: 'json',
    },
    {
      name: 'maps',
      type: 'array',
      fields: [
        {
          name: 'mapName',
          type: 'text',
          required: true,
        },
        {
          name: 'status',
          type: 'text',
        },
        {
          name: 'team1Score',
          type: 'number',
        },
        {
          name: 'team2Score',
          type: 'number',
        },
      ],
    },
    {
      name: 'statusTransitions',
      type: 'array',
      fields: [
        {
          name: 'fromStatus',
          type: 'text',
        },
        {
          name: 'toStatus',
          type: 'text',
          required: true,
        },
        {
          name: 'changedAt',
          type: 'date',
          required: true,
        },
        {
          name: 'source',
          type: 'text',
        },
      ],
    },
    {
      name: 'syncMeta',
      type: 'group',
      fields: [
        {
          name: 'firstSeenAt',
          type: 'date',
        },
        {
          name: 'lastStatusChangeAt',
          type: 'date',
        },
        {
          name: 'lastLiveSeenAt',
          type: 'date',
        },
        {
          name: 'dataCompletenessScore',
          type: 'number',
        },
        {
          name: 'missingCriticalFields',
          type: 'array',
          fields: [
            {
              name: 'field',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'lastSyncedAt',
      type: 'date',
      index: true,
    },
  ],
}

export default Matches
