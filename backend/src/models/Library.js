const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    index: true // Index for faster searching
  },
  description: { 
    type: String, 
    trim: true 
  },
  version: { 
    type: String 
  },
  npmPackageName: { 
    type: String, 
    unique: true, // Assuming npm name is a unique identifier
    sparse: true // Allow null values if not an npm package
  }, 
  githubRepoUrl: { 
    type: String, 
    unique: true, 
    sparse: true // Allow null values if not on GitHub
  },
  tags: [{ 
    type: String, 
    index: true 
  }], // For filtering by category/keywords
  // --- Metrics (potentially updated periodically) ---
  npmDownloadsLastMonth: { 
    type: Number, 
    default: 0 
  },
  githubStars: { 
    type: Number, 
    default: 0 
  },
  githubForks: { 
    type: Number, 
    default: 0 
  },
  githubOpenIssues: { 
    type: Number, 
    default: 0 
  },
  lastCommit: { 
    type: Date 
  },
  license: { 
    type: String 
  },
  // --- Calculated Score (optional) ---
  score: { 
    type: Number, 
    default: 0, 
    index: true // Index for sorting by score
  }, 
  // --- Timestamps ---
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Middleware to update the 'updatedAt' field on save
librarySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Text index for searching name and description
librarySchema.index({ name: 'text', description: 'text' });

const Library = mongoose.model('Library', librarySchema);

module.exports = Library;
