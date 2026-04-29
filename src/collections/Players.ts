import type { CollectionConfig } from 'payload';

const Players: CollectionConfig = {
  slug: 'players',
  admin: {
    useAsTitle: 'nickname',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'nickname',
      type: 'text',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'country',
      type: 'text',
      required: true,
    },
    {
      name: 'age',
      type: 'number',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'IGL', value: 'IGL' },
        { label: 'Entry Fragger', value: 'Entry Fragger' },
        { label: 'AWPer', value: 'AWPer' },
        { label: 'Support', value: 'Support' },
        { label: 'Lurker', value: 'Lurker' },
      ],
    },
    {
      name: 'joinDate',
      type: 'date',
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
    },
  ],
};

export default Players;
