// Simple semantic search implementation
// In a real implementation, you would use a proper embedding model like OpenAI's embeddings API

interface SearchResult {
  title: string;
  content: string;
  url: string;
  score: number;
}

interface ContentItem {
  id: string;
  title: string;
  content: string;
  type: string;
}

// Simple text similarity using TF-IDF and cosine similarity
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);

  const tfidf1 = getTFIDF(words1);
  const tfidf2 = getTFIDF(words2);

  return cosineSimilarity(tfidf1, tfidf2);
}

function getTFIDF(words: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  const totalWords = words.length;

  words.forEach(word => {
    tf.set(word, (tf.get(word) || 0) + 1);
  });

  // Simple TF-IDF (in real implementation, you'd use IDF from corpus)
  tf.forEach((count, word) => {
    tf.set(word, count / totalWords);
  });

  return tf;
}

function cosineSimilarity(tfidf1: Map<string, number>, tfidf2: Map<string, number>): number {
  const allWords = new Set([...tfidf1.keys(), ...tfidf2.keys()]);
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  allWords.forEach(word => {
    const val1 = tfidf1.get(word) || 0;
    const val2 = tfidf2.get(word) || 0;

    dotProduct += val1 * val2;
    norm1 += val1 * val1;
    norm2 += val2 * val2;
  });

  if (norm1 === 0 || norm2 === 0) return 0;

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

export async function performSemanticSearch(query: string, payload: any): Promise<SearchResult[]> {
  try {
    // Get content from various collections
    const contentItems: ContentItem[] = [];

    // Search in Matches collection
    const matches = await payload.find({
      collection: 'matches',
      limit: 100,
    });

    matches.docs.forEach((match: any) => {
      contentItems.push({
        id: match.id,
        title: `Match: ${match.id}`,
        content: `Match between teams with final score ${match.finalScore?.team1 || 0} - ${match.finalScore?.team2 || 0}`,
        type: 'match',
      });
    });

    // Search in Teams collection
    const teams = await payload.find({
      collection: 'teams',
      limit: 100,
    });

    teams.docs.forEach((team: any) => {
      contentItems.push({
        id: team.id,
        title: `Team: ${team.name || team.id}`,
        content: team.description || `Team ${team.name || team.id} information`,
        type: 'team',
      });
    });

    // Search in Players collection
    const players = await payload.find({
      collection: 'players',
      limit: 100,
    });

    players.docs.forEach((player: any) => {
      contentItems.push({
        id: player.id,
        title: `Player: ${player.name || player.id}`,
        content: player.bio || `Player ${player.name || player.id} statistics and information`,
        type: 'player',
      });
    });

    // Calculate similarity scores
    const results: SearchResult[] = contentItems
      .map(item => ({
        title: item.title,
        content: item.content,
        url: `/${item.type}/${item.id}`,
        score: calculateSimilarity(query, item.content),
      }))
      .filter(result => result.score > 0.1) // Filter out low relevance results
      .sort((a, b) => b.score - a.score) // Sort by relevance
      .slice(0, 10); // Return top 10 results

    return results;
  } catch (error) {
    console.error('Error performing semantic search:', error);
    return [];
  }
}
