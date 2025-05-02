const mongoose = require('mongoose'); // Required if running standalone or ensure DB connection elsewhere
const Library = require('../models/Library');
const npmService = require('../services/npmService');
const githubService = require('../services/githubService');
const scoringService = require('../services/scoringService');

// Delay between processing each library to avoid hitting API rate limits (in milliseconds)
const PROCESSING_DELAY = 1000; // 1 second delay

/**
 * Fetches fresh data for a single library, calculates its score, 
 * and updates it in the database.
 * @param {object} library - The library document from the database.
 */
const updateSingleLibraryScore = async (library) => {
  console.log(`Updating score for: ${library.name} (ID: ${library._id})`);
  try {
    // Fetch fresh data
    const [freshNpmData, freshGithubData] = await Promise.all([
      npmService.getNpmData(library.npmPackageName),
      githubService.getGithubData(library.githubRepoUrl)
    ]);

    // Merge data (prioritizing fresh data for scoring relevant fields)
    const mergedData = {
      ...library, // Use existing library data as base
      ...freshNpmData,
      ...freshGithubData,
    };

    // Calculate the new score
    const newScore = scoringService.calculateScore(mergedData);

    // Update the library in the database
    // Only update fields that changed + the score
    await Library.updateOne(
      { _id: library._id }, 
      {
        $set: { 
          // Update score
          score: newScore, 
          // Optionally update metrics that were fetched
          // This keeps the DB data fresher but increases write load
          description: mergedData.description || library.description, // Keep original if fetch failed
          version: mergedData.version || library.version,
          npmDownloadsLastMonth: mergedData.npmDownloadsLastMonth ?? library.npmDownloadsLastMonth,
          githubStars: mergedData.githubStars ?? library.githubStars,
          githubForks: mergedData.githubForks ?? library.githubForks,
          githubOpenIssues: mergedData.githubOpenIssues ?? library.githubOpenIssues,
          lastCommit: mergedData.lastCommit || library.lastCommit,
          license: mergedData.license || library.license,
          // Update the main updatedAt timestamp
          updatedAt: new Date() 
        }
      }
    );

    console.log(`Successfully updated score for ${library.name} to ${newScore}`);

  } catch (error) {
    console.error(`Error updating score for ${library.name} (ID: ${library._id}):`, error);
    // Continue to the next library even if one fails
  }
};

/**
 * Fetches all libraries and updates their scores sequentially with a delay.
 */
const updateAllLibraryScores = async () => {
  console.log('Starting scheduled job: updateAllLibraryScores...');
  try {
    // Ensure DB connection if running independently
    // If scheduled from server.js after connection, this might not be needed
    // await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library_finder');

    const libraries = await Library.find({}).select('_id name npmPackageName githubRepoUrl').lean();
    console.log(`Found ${libraries.length} libraries to process.`);

    for (const library of libraries) {
      // Process each library sequentially
      await updateSingleLibraryScore(library);
      // Wait for the defined delay before processing the next one
      await new Promise(resolve => setTimeout(resolve, PROCESSING_DELAY));
    }

    console.log('Finished scheduled job: updateAllLibraryScores.');

  } catch (error) {
    console.error('Critical error in updateAllLibraryScores job:', error);
  } finally {
    // Disconnect if connected independently
    // await mongoose.disconnect();
  }
};

module.exports = {
  updateAllLibraryScores,
  updateSingleLibraryScore // Export single update potentially for other uses
}; 