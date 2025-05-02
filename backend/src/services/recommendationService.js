const axios = require('axios');

// --- Main Function ---

/**
 * Fetches library recommendations dynamically from the NPM registry based on a query text.
 * @param {string} queryText - The user's free-form query.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of recommendation objects.
 */
const generateRecommendations = async (queryText) => {
  if (!queryText || typeof queryText !== 'string') {
    console.warn('Invalid query text received:', queryText);
    return [];
  }

  const cleanedQuery = queryText.trim();

  if (!cleanedQuery) {
    console.log('Received empty query after trimming.');
    return [];
  }

  // Always query NPM Search API
  console.log(`Querying NPM API for: "${cleanedQuery}"`);
  // Encode the query for the URL
  const encodedQuery = encodeURIComponent(cleanedQuery);
  const npmSearchUrl = `https://registry.npmjs.org/-/v1/search?text=${encodedQuery}&size=15`; // Fetch slightly more results

  try {
    const response = await axios.get(npmSearchUrl);

    if (response.data && response.data.objects && response.data.objects.length > 0) {
      const recommendations = response.data.objects.map(result => {
        const pkg = result.package;
        const scoreDetails = result.score?.detail || {};

        // Basic justification based on NPM scores
        let justification = pkg.description ? `${pkg.description}. ` : 'Found via NPM search. ';
        justification += `(Scores - Pop: ${scoreDetails.popularity?.toFixed(2) ?? 'N/A'}, Qual: ${scoreDetails.quality?.toFixed(2) ?? 'N/A'}, Maint: ${scoreDetails.maintenance?.toFixed(2) ?? 'N/A'})`;

        return {
          name: pkg.name,
          description: pkg.description || 'No description available.',
          url: pkg.links?.npm || pkg.links?.homepage || pkg.links?.repository || '#',
          version: pkg.version,
          justification: justification,
          tags: pkg.keywords || [],
          // Add raw scores if needed by frontend
          scores: {
            popularity: scoreDetails.popularity,
            quality: scoreDetails.quality,
            maintenance: scoreDetails.maintenance,
            final: result.score?.final
          },
          source: 'npm' // Indicate the source is always NPM now
        };
      });
      console.log(`Found ${recommendations.length} recommendations via NPM for query: "${cleanedQuery}"`);
      return recommendations;
    } else {
      console.log(`No results found on NPM for query: "${cleanedQuery}"`);
      return [];
    }
  } catch (error) {
    let errorMessage = error.message;
    if (error.response) {
      errorMessage = `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      errorMessage = 'No response received from NPM API.';
    }
    console.error(`Error fetching recommendations from NPM for query "${cleanedQuery}": ${errorMessage}`);
    return []; // Return empty array on error
  }
};

module.exports = {
  generateRecommendations,
}; 