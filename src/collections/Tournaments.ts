import type { CollectionConfig } from 'payload'

const Tournaments: CollectionConfig = {
  slug: 'tournaments',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'externalTournamentId',
      type: 'number',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      type: 'text',
    },
    {
      name: 'tier',
      type: 'text',
    },
    {
      name: 'tierRank',
      type: 'number',
    },
    {
      name: 'stage',
      type: 'text',
    },
    {
      name: 'importance',
      type: 'select',
      options: [
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' },
      ],
    },
    {
      name: 'prizePool',
      type: 'text',
    },
    {
      name: 'startDate',
      type: 'date',
    },
    {
      name: 'endDate',
      type: 'date',
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'organizer',
      type: 'text',
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: 'bo3.gg',
    },
    {
      name: 'lastSyncedAt',
      type: 'date',
    },
  ],
}

export default Tournaments
