const recommendationService = require('../services/recommendationService');

// @desc    Get library recommendations based on criteria
// @route   POST /api/recommend
// @access  Public (for now)
const getRecommendations = async (req, res) => {
  try {
    // Expect { queryText: "user input..." } in the body
    const { queryText } = req.body; 

    // Basic validation: Ensure queryText is provided
    if (!queryText || typeof queryText !== 'string' || queryText.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide your requirement as text in the \'queryText\' field.' });
    }

    // Need to await the result of the async function
    const recommendations = await recommendationService.generateRecommendations(queryText.trim());

    // Check if any recommendations were found (logic can remain similar)
    if (recommendations.length === 0) {
      return res.status(200).json({ 
        message: 'Could not determine requirements or find specific recommendations based on the provided text. Please try rephrasing.',
        data: []
      });
    }

    res.status(200).json({
      message: 'Recommendations generated successfully',
      data: recommendations
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Server error generating recommendations' });
  }
};

module.exports = {
  getRecommendations,
}; 