const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const { body, param } = require('express-validator'); // For basic validation

// TODO: Add Authentication/Authorization Middleware to protect POST, PUT, DELETE routes

// GET /api/libraries - Get all libraries (add pagination/filtering later?)
router.get('/', libraryController.getAllLibraries);

// POST /api/libraries - Create a new library (Admin only)
router.post('/', 
  [
    // Basic validation examples
    body('name').trim().notEmpty().withMessage('Library name is required'),
    // Add more validation for npmPackageName, githubRepoUrl (format?), etc.
    body('tags').optional().isArray().withMessage('Tags must be an array')
  ],
  libraryController.createLibrary
);

// GET /api/libraries/:id - Get a specific library by ID
router.get('/:id',
  param('id').isMongoId().withMessage('Invalid Library ID format'),
  libraryController.getLibraryById
);

// PUT /api/libraries/:id - Update a library by ID (Admin only)
router.put('/:id',
  param('id').isMongoId().withMessage('Invalid Library ID format'),
  // Add validation for body fields being updated
  libraryController.updateLibrary
);

// DELETE /api/libraries/:id - Delete a library by ID (Admin only)
router.delete('/:id',
  param('id').isMongoId().withMessage('Invalid Library ID format'),
  libraryController.deleteLibrary
);

module.exports = router;