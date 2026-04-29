import { Endpoint } from 'payload/config';
import { performSemanticSearch } from '../utils/semanticSearch';

const searchEndpoint: Endpoint = {
  path: '/search',
  method: 'get',
  handler: async (req, res) => {
    try {
      const { q: query } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          error: 'Query parameter "q" is required',
        });
      }

      const results = await performSemanticSearch(query, req.payload);

      return res.status(200).json({
        query,
        results,
        total: results.length,
      });
    } catch (error) {
      console.error('Search endpoint error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  },
};

export default searchEndpoint;
