// Test file for semantic search functionality
// You can run this to test the search implementation

import { performSemanticSearch } from './semanticSearch';

// Mock payload object for testing
const mockPayload = {
  find: async ({ collection }: { collection: string }) => {
    // Mock data for testing
    const mockData = {
      matches: {
        docs: [
          { id: 'match1', finalScore: { team1: 2, team2: 1 } },
          { id: 'match2', finalScore: { team1: 0, team2: 3 } },
        ],
      },
      teams: {
        docs: [
          { id: 'team1', name: 'Flamengo', description: 'Time brasileiro de futebol' },
          { id: 'team2', name: 'Palmeiras', description: 'Campeão brasileiro' },
        ],
      },
      players: {
        docs: [
          { id: 'player1', name: 'Neymar', bio: 'Jogador brasileiro de futebol' },
          { id: 'player2', name: 'Messi', bio: 'Jogador argentino' },
        ],
      },
    };

    return mockData[collection as keyof typeof mockData] || { docs: [] };
  },
};

async function testSemanticSearch() {
  console.log('Testing Semantic Search...\n');

  const testQueries = [
    'futebol brasileiro',
    'campeão',
    'jogador brasileiro',
    'time carioca',
  ];

  for (const query of testQueries) {
    console.log(`Query: "${query}"`);
    console.log('='.repeat(50));

    try {
      const results = await performSemanticSearch(query, mockPayload);

      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.title}`);
        console.log(`   Score: ${result.score.toFixed(3)}`);
        console.log(`   Content: ${result.content.substring(0, 100)}...`);
        console.log(`   URL: ${result.url}`);
        console.log();
      });
    } catch (error) {
      console.error('Error:', error);
    }

    console.log('\n' + '='.repeat(50) + '\n');
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testSemanticSearch();
}

export { testSemanticSearch };
