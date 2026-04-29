import type { CollectionConfig } from 'payload'

const Teams: CollectionConfig = {
  slug: 'teams',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'externalTeamId',
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
      name: 'shortName',
      type: 'text',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'imageUrl',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'countryId',
      type: 'number',
    },
    {
      name: 'ranking',
      type: 'number',
    },
    {
      name: 'founded',
      type: 'date',
    },
    {
      name: 'region',
      type: 'text',
    },
    {
      name: 'coach',
      type: 'text',
    },
    {
      name: 'players',
      type: 'relationship',
      relationTo: 'players',
      hasMany: true,
    },
    {
      name: 'stats',
      type: 'group',
      fields: [
        {
          name: 'matchesPlayed',
          type: 'number',
        },
        {
          name: 'wins',
          type: 'number',
        },
        {
          name: 'losses',
          type: 'number',
        },
        {
          name: 'winRate',
          type: 'number',
        },
        {
          name: 'averageRating',
          type: 'number',
        },
        {
          name: 'mapsPlayed',
          type: 'number',
        },
        {
          name: 'roundsWon',
          type: 'number',
        },
        {
          name: 'roundsLost',
          type: 'number',
        },
      ],
    },
    {
      name: 'achievements',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'date',
          type: 'date',
        },
        {
          name: 'importance',
          type: 'select',
          options: [
            { label: 'Major', value: 'major' },
            { label: 'Premier', value: 'premier' },
            { label: 'Regional', value: 'regional' },
          ],
        },
      ],
    },
    {
      name: 'socialMedia',
      type: 'group',
      fields: [
        {
          name: 'twitter',
          type: 'text',
        },
        {
          name: 'instagram',
          type: 'text',
        },
        {
          name: 'website',
          type: 'text',
        },
      ],
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

export default Teams
