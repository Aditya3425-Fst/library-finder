import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import libraryService from '../services/libraryService';
import LibraryCard from '../components/LibraryCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/SearchPage.css';

function SearchPage() {
  // --- State for Keyword Search --- 
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // --- State for Recommendations ---
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(null);

  // --- Keyword Search Logic --- 
  const performSearch = useCallback(async (query, page = 1) => {
    if (!query.trim()) {
      setResults([]);
      setPagination(null);
      return; 
    } 
    setSearchLoading(true);
    setSearchError(null);
    setIsSearching(true);
    
    const params = { q: query, page, limit: 10, sortBy: 'score', order: 'desc' };
    try {
      const response = await libraryService.searchLibraries(params);
      setResults(response.data || []);
      setPagination(response.pagination || null);
      
      // After successful search, fetch recommendations based on query
      fetchRecommendations(query);
    } catch (err) {
      setSearchError(err.message || 'An error occurred during search.');
      setResults([]);
      setPagination(null);
    } finally {
      setSearchLoading(false);
      // Small delay to ensure animation plays when results load
      setTimeout(() => setIsSearching(false), 300);
    }
  }, []);
  
  // --- Recommendations Logic ---
  const fetchRecommendations = async (query) => {
    if (!query || query.trim().length < 3) return;
    
    setRecLoading(true);
    setRecError(null);
    
    try {
      const response = await libraryService.getRecommendations(query);
      setRecommendations(response.data || []);
    } catch (err) {
      setRecError(err.message || 'Failed to load recommendations.');
      setRecommendations([]);
    } finally {
      setRecLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(searchQuery, 1); 
  };

  const handlePageChange = (newPage) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    performSearch(searchQuery, newPage);
  };

  // Framer Motion variants
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

  const childVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
      }
    }
  };
  
  // Fade-up variants for recommendations section
  const fadeUpVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 15,
        delay: 0.2,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="search-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* --- Header Section --- */}
      <motion.header 
        className="header-section"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15,
          delay: 0.2
        }}
      >
        <h1 className="main-title">Library Finder</h1>
        <div className="title-decoration"></div>
      </motion.header>

      {/* --- Search Form Section --- */}
      <motion.section 
        className="search-section"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          delay: 0.4,
          duration: 0.6
        }}
      >
        <form onSubmit={handleSearchSubmit} className="search-form">
          <motion.div 
            className="search-input-wrapper"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search libraries by keyword..."
              className="search-input"
            />
            <motion.button 
              type="submit" 
              disabled={searchLoading}
              className="search-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </motion.button>
          </motion.div>
        </form>
      </motion.section>

      {/* --- Results Section --- */}
      <section className="results-section">
        <AnimatePresence mode="wait">
          {searchLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSpinner text="Loading Search Results..." />
            </motion.div>
          )}
          
          {searchError && (
            <motion.div 
              className="error-message" 
              role="alert"
              key="error"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <strong>Error:</strong>
              <span> {searchError}</span>
            </motion.div>
          )}
          
          {!searchLoading && !searchError && (
            <motion.div 
              className="results-container"
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Section title if results exist */}
              {results.length > 0 && (
                <motion.h2 
                  className="section-title"
                  variants={childVariants}
                >
                  Search Results
                </motion.h2>
              )}
              
              <motion.div className="library-grid" layout>
                {results.map((library, index) => (
                  <motion.div 
                    key={library._id || index} 
                    className="library-card-wrapper"
                    variants={childVariants}
                    layoutId={`library-${library._id || index}`}
                    custom={index} // Used for staggered animations
                  >
                    <LibraryCard 
                      library={library}
                    />
                  </motion.div>
                ))}
              </motion.div>
              
              {results.length === 0 && searchQuery && !isSearching && (
                <motion.p 
                  className="no-results-message"
                  variants={childVariants}
                >
                  No results found for "{searchQuery}".
                </motion.p>
              )}
              
              {pagination && pagination.totalPages > 1 && (
                <Pagination 
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      
      {/* --- Recommendations Section --- */}
      {!searchLoading && !searchError && recommendations.length > 0 && (
        <motion.section 
          className="recommendations-section"
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className="section-title recommended-title"
            variants={childVariants}
          >
            <span className="recommendation-icon">💡</span> Recommended Libraries
          </motion.h2>
          
          {recLoading ? (
            <div className="recommendation-loading">
              <LoadingSpinner text="Loading recommendations..." />
            </div>
          ) : (
            <div className="recommendations-grid">
              {recommendations.map((library, index) => (
                <motion.div 
                  key={`rec-${library._id || library.name}-${index}`} 
                  className="library-card-wrapper recommendation-card-wrapper"
                  variants={childVariants}
                  custom={index}
                >
                  <LibraryCard 
                    library={library}
                    isRecommended={true}
                  />
                  {library.reason && (
                    <motion.div 
                      className="recommendation-reason"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (index * 0.1) }}
                    >
                      <span className="reason-label">Why recommended:</span> {library.reason}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
          
          {recError && (
            <motion.div 
              className="recommendation-error" 
              role="alert"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <strong>Note:</strong>
              <span> {recError}</span>
            </motion.div>
          )}
        </motion.section>
      )}
    </motion.div>
  );
}

export default SearchPage;