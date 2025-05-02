import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/LibraryCard.css';

// Enhanced LibraryCard component with expanded features
function LibraryCard({ library, isRecommended = false }) {
  const [isSnippetOpen, setIsSnippetOpen] = useState(false);
  
  // Format numbers for readability
  const formatNumber = (num) => {
    if (num === undefined || num === null) return 'N/A';
    return num.toLocaleString();
  };
  
  // Format date to "time ago" format
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    
    // Convert to appropriate time units
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Extract data safely from potential structure
  const name = library?.name || 'Unnamed Package';
  const description = library?.description || 'No description available.';
  const version = library?.version || 'N/A';
  const license = library?.license || 'N/A';
  const score = library?.score ?? 'N/A'; 
  const tags = library?.tags || [];
  const npmUrl = library?.npmUrl || `https://www.npmjs.com/package/${name}`;
  const homepageUrl = library?.homepageUrl;
  const githubUrl = library?.githubRepoUrl;
  
  // Additional properties
  const publishedDate = library?.updatedAt || library?.lastUpdated || null;
  
  // Does this library have TypeScript support?
  const hasTypeScript = library?.hasTypeScript || tags.some(tag => 
    tag.toLowerCase().includes('typescript') || tag.toLowerCase().includes('types')
  );
  
  // Generate a basic usage snippet based on the library name
  const getUsageSnippet = () => {
    const isReact = name.toLowerCase().includes('react') || tags.some(tag => 
      tag.toLowerCase().includes('react') || tag.toLowerCase().includes('component')
    );
    
    const importName = name.replace(/[-/]/g, '').replace(/\..*$/, '');
    
    if (isReact) {
      return `// React component example
import { ${importName.charAt(0).toUpperCase() + importName.slice(1)} } from '${name}';

function Example() {
  return <${importName.charAt(0).toUpperCase() + importName.slice(1)} />;
}`;
    } else {
      return `// Basic usage
import ${importName} from '${name}';

// Example usage
const result = ${importName}();`;
    }
  };

  return (
    <motion.div 
      className={`library-card ${isRecommended ? 'recommended' : ''}`}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      layout
    >
      {/* Recommendation badge */}
      {isRecommended && (
        <div className="recommended-badge">Recommended</div>
      )}
      
      {/* TypeScript badge */}
      {hasTypeScript && (
        <div className="typescript-badge">
          <span className="ts-logo">TS</span>
        </div>
      )}
      
      {/* Header section with name and version */}
      <div className="library-card-header">
        <h3>
          {npmUrl ? (
            <a href={npmUrl} target="_blank" rel="noopener noreferrer">{name}</a>
          ) : name}
        </h3>
        <div className="version-info">
          <span className="version">v{version}</span>
          {publishedDate && (
            <span className="published-date">Published {formatTimeAgo(publishedDate)}</span>
          )}
        </div>
      </div>
      
      <p className="library-card-description">{description}</p>
      
      <div className="library-card-metrics">
        <span className="metric-item"><i className="metric-icon">★</i>{Math.round(score * 100) / 100}</span>
        <span className="metric-item">{license}</span>
      </div>
      
      {/* Expandable usage snippet */}
      <div className="usage-snippet-section">
        <button 
          className="snippet-toggle"
          onClick={() => setIsSnippetOpen(!isSnippetOpen)}
          aria-expanded={isSnippetOpen}
        >
          {isSnippetOpen ? 'Hide Usage Example' : 'Show Usage Example'}
          <span className={`toggle-arrow ${isSnippetOpen ? 'open' : ''}`}>▼</span>
        </button>
        
        <AnimatePresence>
          {isSnippetOpen && (
            <motion.div 
              className="snippet-container"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <pre className="code-snippet">
                <code>{getUsageSnippet()}</code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Enhanced links section */}
      <div className="library-card-links">
        <a href={npmUrl} target="_blank" rel="noopener noreferrer" className="link-npm">
          <span className="link-icon">📦</span> NPM
        </a>
        {githubUrl && (
          <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="link-github">
            <span className="link-icon">💻</span> GitHub
          </a>
        )}
        {homepageUrl && (
          <a href={homepageUrl} target="_blank" rel="noopener noreferrer" className="link-docs">
            <span className="link-icon">📖</span> Docs
          </a>
        )}
      </div>
      
      {/* Render tags if they exist */}
      {tags.length > 0 && (
        <div className="library-card-tags">
          {tags.slice(0, 5).map(tag => <span key={tag} className="tag">{tag}</span>)}
          {tags.length > 5 && <span className="more-tags">+{tags.length - 5} more</span>}
        </div>
      )}
    </motion.div>
  );
}

export default LibraryCard; 