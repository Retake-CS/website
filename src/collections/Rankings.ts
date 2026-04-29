import type { CollectionConfig } from 'payload';

const Rankings: CollectionConfig = {
  slug: 'rankings',
  admin: {
    useAsTitle: 'position',
    group: 'CS2',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'position',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
      hasMany: false,
    },
    {
      name: 'points',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'change',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'trend',
      type: 'select',
      required: true,
      options: [
        { label: 'Up', value: 'up' },
        { label: 'Down', value: 'down' },
        { label: 'Stable', value: 'stable' },
      ],
      defaultValue: 'stable',
    },
    {
      name: 'region',
      type: 'select',
      required: true,
      options: [
        { label: 'Mundial', value: 'mundial' },
        { label: 'Europe', value: 'europe' },
        { label: 'Americas', value: 'americas' },
        { label: 'Asia', value: 'asia' },
        { label: 'Oceania', value: 'oceania' },
      ],
      defaultValue: 'mundial',
    },
    {
      name: 'country',
      type: 'text',
      required: true,
    },
    {
      name: 'lastUpdated',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Se o ranking está ativo e deve ser exibido',
      },
    },
  ],
  timestamps: true,
};

export default Rankings;
