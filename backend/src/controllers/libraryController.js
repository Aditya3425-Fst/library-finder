const Library = require('../models/Library');
const { validationResult } = require('express-validator');
const scoringService = require('../services/scoringService'); // To calculate initial score on create/update

// @desc    Get all libraries
// @route   GET /api/libraries
// @access  Public (for now)
const getAllLibraries = async (req, res) => {
  try {
    // Basic implementation: get all. Add pagination/filtering later.
    const libraries = await Library.find({}).sort({ name: 1 }).lean(); 
    res.status(200).json({ 
      message: 'Libraries retrieved successfully',
      count: libraries.length,
      data: libraries 
    });
  } catch (error) {
    console.error('Error getting all libraries:', error);
    res.status(500).json({ message: 'Server error retrieving libraries' });
  }
};

// @desc    Create a new library
// @route   POST /api/libraries
// @access  Private (Admin only - Needs protection)
const createLibrary = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, npmPackageName, githubRepoUrl, tags, license /* include other fields */ } = req.body;

    // Check if library already exists (e.g., by name, npm package, or github url)
    let existingLibrary = await Library.findOne({ $or: [
      { name }, 
      ...(npmPackageName ? [{ npmPackageName }] : []),
      ...(githubRepoUrl ? [{ githubRepoUrl }] : [])
    ]});

    if (existingLibrary) {
      return res.status(400).json({ message: 'Library with this name, npm package, or GitHub URL already exists' });
    }

    // Create new library instance - potentially fetch initial metrics/score?
    // For now, just use provided data and calculate a basic score
    const newLibraryData = {
      name,
      description,
      npmPackageName,
      githubRepoUrl,
      tags,
      license,
      // Add defaults or fetch initial values for metrics if desired
    };

    // Calculate an initial score if possible (might be 0 if no metrics provided)
    newLibraryData.score = scoringService.calculateScore(newLibraryData);

    const newLibrary = await Library.create(newLibraryData);

    res.status(201).json({ 
      message: 'Library created successfully',
      data: newLibrary
    });

  } catch (error) {
    console.error('Error creating library:', error);
    res.status(500).json({ message: 'Server error creating library' });
  }
};

// @desc    Get a single library by ID
// @route   GET /api/libraries/:id
// @access  Public (for now)
const getLibraryById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const library = await Library.findById(req.params.id).lean();

    if (!library) {
      return res.status(404).json({ message: 'Library not found' });
    }

    res.status(200).json({ 
      message: 'Library retrieved successfully',
      data: library 
    });
  } catch (error) {
    console.error('Error getting library by ID:', error);
    // Handle CastError specifically if ID format is wrong but passed validator (unlikely with isMongoId)
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid Library ID format' });
    }
    res.status(500).json({ message: 'Server error retrieving library' });
  }
};

// @desc    Update a library by ID
// @route   PUT /api/libraries/:id
// @access  Private (Admin only - Needs protection)
const updateLibrary = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const library = await Library.findById(req.params.id);

    if (!library) {
      return res.status(404).json({ message: 'Library not found' });
    }

    // Get updated fields from body
    const { name, description, npmPackageName, githubRepoUrl, tags, license, /* include other fields */ } = req.body;

    // Prepare update object - only include fields that are actually provided in the request
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (npmPackageName !== undefined) updateFields.npmPackageName = npmPackageName;
    if (githubRepoUrl !== undefined) updateFields.githubRepoUrl = githubRepoUrl;
    if (tags !== undefined) updateFields.tags = tags;
    if (license !== undefined) updateFields.license = license;
    // Add other updatable fields

    // Recalculate score if relevant metrics change?
    // For simplicity, we can just update fields. Score gets updated by background job.
    // Or, could recalculate here if needed immediately.
    // const tempUpdatedData = { ...library.toObject(), ...updateFields };
    // updateFields.score = scoringService.calculateScore(tempUpdatedData);

    updateFields.updatedAt = new Date(); // Manually update timestamp

    const updatedLibrary = await Library.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true, runValidators: true }).lean();

    res.status(200).json({ 
      message: 'Library updated successfully',
      data: updatedLibrary 
    });

  } catch (error) {
    console.error('Error updating library:', error);
    // Handle potential validation errors during update
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Update validation failed', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error updating library' });
  }
};

// @desc    Delete a library by ID
// @route   DELETE /api/libraries/:id
// @access  Private (Admin only - Needs protection)
const deleteLibrary = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const library = await Library.findById(req.params.id);

    if (!library) {
      return res.status(404).json({ message: 'Library not found' });
    }

    await library.deleteOne(); // Use deleteOne on the document

    res.status(200).json({ 
      message: 'Library deleted successfully',
      data: {} // Or return the deleted library ID: { id: req.params.id }
    });

  } catch (error) {
    console.error('Error deleting library:', error);
    res.status(500).json({ message: 'Server error deleting library' });
  }
};

module.exports = {
  getAllLibraries,
  createLibrary,
  getLibraryById,
  updateLibrary,
  deleteLibrary
};
