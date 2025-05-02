const axios = require('axios');

// Map our sortBy values to NPM registry API's ranking preferences
// See: https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md#get-v1search
const mapSortToNpmRanking = (sortBy) => {
  switch (sortBy?.toLowerCase()) {
    case 'popularity':
      return 'popularity';
    case 'quality':
      return 'quality';
    case 'maintenance':
      return 'maintenance';
    // Add more mappings if needed, or handle our custom ones differently
    case 'score': // NPM's default 'optimal' is a mix, closest to our 'score'
    default:
      return 'optimal'; 
  }
};

const searchLibraries = async (req, res) => {
  try {
    // Get query parameters relevant for NPM search
    const { 
      q, 
      sortBy = 'score', // Use our 'score' as default, maps to 'optimal'
      limit = 10, 
      page = 1 
      // Note: NPM search doesn't directly support 'order', tags, license filtering in the same way
    } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query (q) is required' });
    }

    const queryLimit = parseInt(limit) || 10;
    const queryPage = parseInt(page) || 1;
    const queryFrom = (queryPage - 1) * queryLimit;
    const npmRanking = mapSortToNpmRanking(sortBy);

    const npmSearchUrl = `https://registry.npmjs.org/-/v1/search`;

    console.log(`Querying NPM Registry: q=${q}, size=${queryLimit}, from=${queryFrom}, ranking=${npmRanking}`);

    // Execute request to NPM Registry API
    const response = await axios.get(npmSearchUrl, {
      params: {
        text: q,
        size: queryLimit,
        from: queryFrom,
        // Quality/Popularity/Maintenance weights could be added here if needed
        // ranking: npmRanking // It seems 'ranking' is not a direct query param, but influences weights?
                                // Let's rely on default optimal/popularity mix for now. Weights can fine-tune.
      }
    });

    const npmData = response.data;

    // Format response to match roughly what frontend expects
    const libraries = npmData.objects.map(item => ({
        // Extract relevant fields from item.package and item.score
        // Need to adapt frontend LibraryCard to use this structure!
        _id: `npm:${item.package.name}`, // Use a synthetic ID
        name: item.package.name,
        description: item.package.description,
        version: item.package.version,
        npmPackageName: item.package.name,
        githubRepoUrl: item.package.links?.repository, // May not always be GitHub
        npmUrl: item.package.links?.npm,
        homepageUrl: item.package.links?.homepage,
        tags: item.package.keywords || [],
        lastCommit: item.package.date ? new Date(item.package.date) : null, // Publisher date, not commit
        license: item.package.license || 'N/A',
        // We don't get stars/downloads directly from basic search
        // We could approximate a score based on NPM's score components?
        score: Math.round((item.score?.final || 0) * 100), // Convert NPM 0-1 score to 0-100
        npmScoreDetail: item.score?.detail // Include details if needed
    }));

    const totalLibraries = npmData.total || 0;
    const totalPages = Math.ceil(totalLibraries / queryLimit);

    res.status(200).json({
      message: 'Search successful via NPM Registry',
      data: libraries,
      pagination: {
        currentPage: queryPage,
        totalPages: totalPages,
        totalResults: totalLibraries,
        limit: queryLimit
      }
    });

  } catch (error) {
    console.error('NPM Search error:', error.response?.data || error.message);
    if (error.response?.status === 404) {
         return res.status(404).json({ message: 'NPM search endpoint not found?' });
    }
    res.status(500).json({ message: 'Error searching NPM Registry', error: error.message });
  }
};

module.exports = {
  searchLibraries
};
