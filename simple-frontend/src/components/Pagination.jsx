import React from 'react';
import { motion } from 'framer-motion';
import '../styles/Pagination.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) {
    return null; // Don't render if only one page or no pages
  }
  
  // Calculate which page numbers to display
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxDisplay = 5; // Maximum number of page buttons to display
    
    if (totalPages <= maxDisplay) {
      // Show all pages if less than or equal to maxDisplay
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end of displayed page numbers
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, start + 2);
      
      // Adjust if at the end
      if (end === totalPages - 1) {
        start = Math.max(2, end - 2);
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <motion.div 
      className="pagination-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 15
      }}
    >
      <motion.button 
        className="pagination-button prev"
        whileHover={{ x: -3 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
        </svg>
        Previous
      </motion.button>
      
      <div className="pagination-pages">
        {renderPageNumbers().map((page, index) => 
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
          ) : (
            <motion.div 
              key={page} 
              className={`pagination-page ${page === currentPage ? 'active' : ''}`}
              onClick={() => page !== currentPage && onPageChange(page)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {page}
            </motion.div>
          )
        )}
      </div>
      
      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>
      
      <motion.button 
        className="pagination-button next"
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>
      </motion.button>
    </motion.div>
  );
}

export default Pagination; 