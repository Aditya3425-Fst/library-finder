import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import libraryService from '../services/libraryService';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/RecommendPage.css';

function RecommendPage() {
  const [recQueryText, setRecQueryText] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(null);

  // Removed filter states (functionality, techStack, scale, useCase)
  // Removed filter options arrays

  // Handler for fetching recommendations based on text query
  const handleGetRecommendations = useCallback(async (e) => {
    e.preventDefault();
    const query = recQueryText.trim();
    if (!query) {
      setRecError('Please describe the library you are looking for.');
      setRecommendations([]); // Clear previous results
      return;
    }

    setRecLoading(true);
    setRecError(null);
    setRecommendations([]);

    try {
      // Call the simplified service function
      const response = await libraryService.getRecommendations(query);
      const newRecommendations = response.data || [];
      setRecommendations(newRecommendations);
      if (newRecommendations.length === 0) {
        setRecError('No recommendations found for your query. Try refining your description.');
      }
    } catch (err) {
      setRecError(err.response?.data?.message || err.message || 'An error occurred while fetching recommendations.');
      setRecommendations([]);
    } finally {
      setRecLoading(false);
    }
  }, [recQueryText]); // Dependency is now just the query text

  // Framer Motion variants (unchanged)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12
      }
    }
  };

  return (
    <motion.div
      className="recommend-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.section
        className="recommend-hero"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 12 }}
      >
        <h1 className="recommend-title">Smart Library Recommendations</h1>
        <p className="recommend-subtitle">
          Describe what you need, and we'll suggest relevant libraries from NPM.
        </p>

        <motion.form
          onSubmit={handleGetRecommendations}
          className="recommendation-form single-input-form" // Added class for potential styling adjustments
          // Removed hover animation from form for simplicity
        >
          {/* Removed filter dropdowns */}

          <div className="form-group main-query-group">
            <label htmlFor="recQuery" className="form-label sr-only"> {/* Label visually hidden but accessible */}
              Describe your requirement
            </label>
            <motion.textarea
              id="recQuery"
              rows={3} // Slightly larger text area
              value={recQueryText}
              onChange={(e) => setRecQueryText(e.target.value)}
              placeholder="e.g., 'Library for authentication in Express apps', 'React state management for large scale', 'Node.js hashing library' ..." // Updated placeholder
              className="form-textarea main-query-input"
              whileFocus={{ scale: 1.02, borderColor: '#6366f1' }} // Enhanced focus effect
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            />
          </div>
          <motion.button
            type="submit"
            disabled={recLoading}
            className="recommend-button"
            whileHover={{ scale: 1.03, backgroundColor: '#4338ca' }} // Enhanced hover effect
            whileTap={{ scale: 0.97 }}
          >
            {recLoading ? 'Analyzing...' : 'Find Libraries'}
          </motion.button>
        </motion.form>
      </motion.section>

      {/* Recommendation Results Section */}
      <section className="recommendations-section">
        <AnimatePresence mode="wait">
          {recLoading && (
            <motion.div
              key="loading"
              className="recommend-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSpinner text="Searching the NPM registry..." /> {/* Updated loading text */}
            </motion.div>
          )}

          {recError && (
            <motion.div
              className="recommend-error-message"
              role="alert"
              key="error"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              {recError}
            </motion.div>
          )}

          {!recLoading && recommendations.length > 0 && (
            <motion.div
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h3 className="recommendations-header">
                {/* Icon can remain */}
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  💡
                </motion.span>
                Suggested Libraries
              </h3>

              <div className="recommendations-list">
                {recommendations.map((rec, index) => (
                  <motion.div
                    // Use rec.name + index for a more stable key if names could repeat in theory
                    key={`${rec.name}-${index}`}
                    className="recommendation-card"
                    variants={itemVariants}
                    custom={index}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)" // Adjusted shadow
                    }}
                  >
                    <h4 className="recommendation-name">{rec.name}</h4>
                    {/* Use description field now */}
                    <p className="recommendation-description">{rec.description}</p>
                    {rec.url && rec.url !== '#' && ( // Check for valid URL
                      <a
                        href={rec.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="recommendation-link"
                      >
                        View on NPM →
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}

export default RecommendPage; 