import axios from 'axios';

// Ensure the API_URL matches your backend server address
const API_URL = 'http://localhost:3001/api'; 

const libraryService = {
  /**
   * Searches libraries based on query, filters, sorting, and pagination.
   * @param {object} params - Search parameters.
   * @param {string} params.q - Search query.
   * @param {string} [params.tags] - Comma-separated tags.
   * @param {string} [params.license] - License identifier.
   * @param {string} [params.sortBy] - Field to sort by (score, stars, downloads, etc.).
   * @param {string} [params.order] - Sort order ('asc' or 'desc').
   * @param {number} [params.page] - Page number.
   * @param {number} [params.limit] - Results per page.
   * @returns {Promise<object>} - The API response data (including results and pagination).
   */
  async searchLibraries(params) {
    try {
      // Filter out undefined/null params before sending
      const filteredParams = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
        
      const response = await axios.get(`${API_URL}/search`, { params: filteredParams });
      return response.data; // { message, data: libraries, pagination }
    } catch (error) {
      console.error('Error searching libraries:', error.response?.data || error.message);
      // Re-throw the error or return a specific error structure
      throw error.response?.data || new Error('Failed to search libraries');
    }
  },

  /**
   * Gets library recommendations based on user criteria text.
   * @param {string} queryText - User's free-form text input.
   * @returns {Promise<object>} - The API response data (recommendations with reasons).
   */
  async getRecommendations(queryText) {
    try {
      // Ensure text is provided
      if (!queryText || typeof queryText !== 'string' || queryText.trim().length === 0) {
          throw new Error('Requirement text is needed for recommendations.');
      }
      // Send as { queryText: "..." } in the body
      const response = await axios.post(`${API_URL}/recommend`, { queryText });
      return response.data; // { message, data: recommendations }
    } catch (error) {
      console.error('Error getting recommendations:', error.response?.data || error.message);
      // Re-throw the error or return a specific error structure
      throw error.response?.data || new Error('Failed to get recommendations');
    }
  },
  
  /**
   * Gets library recommendations based on direct criteria selections.
   * @param {object} criteria - Structured criteria for recommendations
   * @param {string} [criteria.functionality] - The functionality category
   * @param {string} [criteria.stack] - The tech stack
   * @param {string} [criteria.scale] - Scale of project (small, medium, large)
   * @param {string} [criteria.useCase] - Specific use case
   * @param {string} [criteria.additionalText] - Any additional description text
   * @returns {Promise<object>} - The API response data (recommendations with reasons)
   */
  async getRecommendationsByCriteria(criteria) {
    try {
      // Construct query string from criteria
      const queryParts = [];
      if (criteria.functionality) queryParts.push(criteria.functionality);
      if (criteria.stack) queryParts.push(criteria.stack);
      if (criteria.scale) queryParts.push(criteria.scale);
      if (criteria.useCase) queryParts.push(criteria.useCase);
      if (criteria.additionalText) queryParts.push(criteria.additionalText);
      
      // Ensure at least one criterion is provided
      if (queryParts.length === 0) {
        throw new Error('At least one recommendation criterion is required.');
      }
      
      // Convert criteria to query text as expected by backend
      const queryText = queryParts.join(' ');
      
      // Use the existing endpoint
      const response = await axios.post(`${API_URL}/recommend`, { queryText });
      return response.data;
    } catch (error) {
      console.error('Error getting recommendations by criteria:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to get recommendations');
    }
  },

  /**
   * Fetches a specific library by ID.
   * @param {string} libraryId - The ID of the library to fetch.
   * @returns {Promise<object>} - The library data.
   */
  async getLibrary(libraryId) {
    try {
      if (!libraryId) {
        throw new Error('Library ID is required.');
      }
      const response = await axios.get(`${API_URL}/libraries/${libraryId}`);
      return response.data; // { message, data: library }
    } catch (error) {
      console.error('Error getting library details:', error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to get library details');
    }
  },

};

export default libraryService; 