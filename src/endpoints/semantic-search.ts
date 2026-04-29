import { Endpoint } from 'payload';
import { performSemanticSearch } from '../utils/semanticSearch';

const searchEndpoint: Endpoint = {
  path: '/search',
  method: 'get',
  handler: async (req) => {
    try {
      if (!req.url) {
        return Response.json({ error: 'Request URL is missing' }, { status: 400 });
      }
      const url = new URL(req.url);
      const query = url.searchParams.get('q');

      if (!query || typeof query !== 'string') {
        return Response.json({ error: 'Query parameter "q" is required' }, { status: 400 });
      }

      const results = await performSemanticSearch(query, req.payload);

      return Response.json({
        query,
        results,
        total: results.length,
      }, { status: 200 });
    } catch (error) {
      console.error('Search endpoint error:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
};

export default searchEndpoint;
