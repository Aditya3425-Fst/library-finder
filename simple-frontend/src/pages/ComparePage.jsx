import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import libraryService from '../services/libraryService';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/ComparePage.css';

function ComparePage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        // Get library IDs from location state
        const libraryIds = location.state?.libraryIds || [];
        
        if (libraryIds.length < 2) {
          throw new Error('At least two libraries must be selected for comparison');
        }
        
        setLoading(true);
        const response = await libraryService.compareLibraries(libraryIds);
        setLibraries(response.data || []);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load comparison data');
        setLoading(false);
      }
    };

    fetchLibraries();
  }, [location.state]);

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (num === undefined || num === null) return 'N/A';
    return num.toLocaleString();
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Helper function to calculate progress for visual bars
  const calculateProgress = (value, max) => {
    if (!value || !max) return 0;
    return Math.min(100, Math.round((value / max) * 100));
  };

  // Find max values for relative comparisons
  const maxValues = libraries.reduce((acc, lib) => {
    return {
      stars: Math.max(acc.stars, lib.githubStars || 0),
      downloads: Math.max(acc.downloads, lib.npmDownloadsLastMonth || 0),
      score: Math.max(acc.score, lib.score || 0),
    };
  }, { stars: 0, downloads: 0, score: 0 });

  return (
    <motion.div 
      className="compare-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.header 
        className="compare-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15,
          delay: 0.2
        }}
      >
        <h1 className="compare-title">Library Comparison</h1>
        <div className="title-accent"></div>
        <motion.button 
          onClick={() => navigate(-1)} 
          className="back-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back to Search
        </motion.button>
      </motion.header>

      {loading && (
        <div className="compare-loading">
          <LoadingSpinner text="Loading comparison data..." />
        </div>
      )}
      
      {error && (
        <motion.div 
          className="compare-error" 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <p>{error}</p>
          <motion.button 
            onClick={() => navigate(-1)}
            className="error-back-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Search
          </motion.button>
        </motion.div>
      )}
      
      {!loading && !error && libraries.length >= 2 && (
        <div className="comparison-container">
          {/* Comparison Header Row */}
          <div className="comparison-header-row">
            <div className="comparison-metric-label"></div>
            {libraries.map((library, index) => (
              <motion.div 
                key={`header-${library._id || index}`}
                className="comparison-card-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <h2 className="library-name">{library.name}</h2>
                <p className="library-version">v{library.version || 'N/A'}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Description Row */}
          <div className="comparison-row">
            <div className="comparison-metric-label">Description</div>
            {libraries.map((library, index) => (
              <motion.div 
                key={`desc-${library._id || index}`}
                className="comparison-cell"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.4 }}
              >
                <p className="library-description">{library.description || 'No description available'}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Popularity Metrics */}
          <div className="comparison-row">
            <div className="comparison-metric-label">
              <span className="metric-icon">⭐</span> GitHub Stars
            </div>
            {libraries.map((library, index) => (
              <motion.div 
                key={`stars-${library._id || index}`}
                className="comparison-cell"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                <div className="metric-value">{formatNumber(library.githubStars)}</div>
                <div className="progress-bar-container">
                  <motion.div 
                    className="progress-bar stars"
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateProgress(library.githubStars, maxValues.stars)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="comparison-row">
            <div className="comparison-metric-label">
              <span className="metric-icon">📦</span> NPM Downloads
            </div>
            {libraries.map((library, index) => (
              <motion.div 
                key={`downloads-${library._id || index}`}
                className="comparison-cell"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.6 }}
              >
                <div className="metric-value">{formatNumber(library.npmDownloadsLastMonth)}</div>
                <div className="progress-bar-container">
                  <motion.div 
                    className="progress-bar downloads"
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateProgress(library.npmDownloadsLastMonth, maxValues.downloads)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="comparison-row">
            <div className="comparison-metric-label">
              <span className="metric-icon">📊</span> Score
            </div>
            {libraries.map((library, index) => (
              <motion.div 
                key={`score-${library._id || index}`}
                className="comparison-cell"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.7 }}
              >
                <div className="metric-value">{library.score ? (Math.round(library.score * 100) / 100) : 'N/A'}</div>
                <div className="progress-bar-container">
                  <motion.div 
                    className="progress-bar score"
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateProgress(library.score, maxValues.score)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Date and Metadata */}
          <div className="comparison-row">
            <div className="comparison-metric-label">
              <span className="metric-icon">📅</span> Last Updated
            </div>
            {libraries.map((library, index) => (
              <motion.div 
                key={`date-${library._id || index}`}
                className="comparison-cell"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.8 }}
              >
                <div className="metric-value">{formatDate(library.lastUpdated)}</div>
              </motion.div>
            ))}
          </div>
          
          <div className="comparison-row">
            <div className="comparison-metric-label">
              <span className="metric-icon">📄</span> License
            </div>
            {libraries.map((library, index) => (
              <motion.div 
                key={`license-${library._id || index}`}
                className="comparison-cell"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.9 }}
              >
                <div className="metric-value license-badge">{library.license || 'Unknown'}</div>
              </motion.div>
            ))}
          </div>
          
          {/* Tags/Keywords */}
          <div className="comparison-row">
            <div className="comparison-metric-label">
              <span className="metric-icon">🏷️</span> Tags
            </div>
            {libraries.map((library, index) => (
              <motion.div 
                key={`tags-${library._id || index}`}
                className="comparison-cell"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 1.0 }}
              >
                <div className="tags-container">
                  {library.tags && library.tags.length > 0 ? (
                    library.tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))
                  ) : (
                    <span className="no-tags">No tags available</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Links */}
          <div className="comparison-row">
            <div className="comparison-metric-label">
              <span className="metric-icon">🔗</span> Links
            </div>
            {libraries.map((library, index) => (
              <motion.div 
                key={`links-${library._id || index}`}
                className="comparison-cell"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 1.1 }}
              >
                <div className="links-container">
                  {library.npmUrl && (
                    <a href={library.npmUrl} target="_blank" rel="noopener noreferrer" className="library-link npm-link">
                      NPM
                    </a>
                  )}
                  {library.githubRepoUrl && (
                    <a href={library.githubRepoUrl} target="_blank" rel="noopener noreferrer" className="library-link github-link">
                      GitHub
                    </a>
                  )}
                  {library.homepageUrl && (
                    <a href={library.homepageUrl} target="_blank" rel="noopener noreferrer" className="library-link homepage-link">
                      Homepage
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ComparePage; 