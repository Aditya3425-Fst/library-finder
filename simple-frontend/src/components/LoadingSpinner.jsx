import React from 'react';
import { motion } from 'framer-motion';
import '../styles/LoadingSpinner.css';

// Simple text-based loading indicator
function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <motion.div 
      className="spinner-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <p className="spinner-text">{text}</p>
      
      {/* Alternative dot loader - comment out one of these */}
      {/* <div className="dot-loader">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div> */}
    </motion.div>
  );
}

export default LoadingSpinner; 