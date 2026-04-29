import type { CollectionConfig } from 'payload';
import { performSemanticSearch } from '../utils/semanticSearch';

const SemanticSearch: CollectionConfig = {
  slug: 'semantic-search',
  admin: {
    useAsTitle: 'query',
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'query',
      type: 'text',
      required: true,
      label: 'Search Query',
    },
    {
      name: 'results',
      type: 'array',
      label: 'Search Results',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Result Title',
        },
        {
          name: 'content',
          type: 'textarea',
          label: 'Result Content',
        },
        {
          name: 'url',
          type: 'text',
          label: 'Result URL',
        },
        {
          name: 'score',
          type: 'number',
          label: 'Relevance Score',
        },
      ],
    },
    {
      name: 'timestamp',
      type: 'date',
      defaultValue: () => new Date(),
      label: 'Search Timestamp',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Implement semantic search logic here
        if (data.query) {
          const results = await performSemanticSearch(data.query, req.payload);
          return {
            ...data,
            results,
          };
        }
        return data;
      },
    ],
  },
};

export default SemanticSearch;
