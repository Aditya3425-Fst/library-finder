const MAX_STARS = 250000; // Assumed reasonable max for normalization
const MAX_DOWNLOADS = 50000000; // Assumed reasonable max for normalization
const MAX_RECENCY_DAYS = 365; // Penalize heavily if no commit in a year

const MAX_STARS_LOG = Math.log10(250000 + 1); // Log10 of assumed max stars + 1
const MAX_DOWNLOADS_LOG = Math.log10(50000000 + 1); // Log10 of assumed max downloads + 1

/**
 * Normalizes a value to a 0-1 scale, capping at a max value.
 * Uses simple linear scaling for now.
 * @param {number} value The value to normalize.
 * @param {number} maxValue The maximum expected value for scaling.
 * @returns {number} Normalized value between 0 and 1.
 */
const normalizeLinear = (value, maxValue) => {
  if (!value || value <= 0) return 0;
  return Math.min(value / maxValue, 1); // Cap at 1
};

/**
 * Normalizes a value to a 0-1 scale using base-10 logarithmic scaling.
 * Useful for values with very large ranges (stars, downloads).
 * Adds 1 before log to handle value=0.
 * @param {number} value The value to normalize.
 * @param {number} maxValueLog The log10 of the maximum expected value + 1.
 * @returns {number} Normalized value between 0 and 1.
 */
const normalizeLog = (value, maxValueLog) => {
  if (!value || value <= 0) return 0;
  const logValue = Math.log10(value + 1);
  return Math.min(logValue / maxValueLog, 1);
};

/**
 * Normalizes recency based on days since the last commit.
 * More recent commits get higher scores (closer to 1).
 * @param {Date | string | null} lastCommitDate The date of the last commit.
 * @param {number} maxDays Maximum days to consider for full penalty.
 * @returns {number} Normalized recency score between 0 and 1.
 */
const normalizeRecency = (lastCommitDate, maxDays) => {
  if (!lastCommitDate) return 0; // No date = lowest score
  try {
    const lastCommit = new Date(lastCommitDate);
    const now = new Date();
    const diffTime = Math.abs(now - lastCommit);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 1; // Commit today or in future?
    if (diffDays > maxDays) return 0;

    // Score decreases linearly as days increase
    return 1 - (diffDays / maxDays);
  } catch (e) {
    console.error('Error parsing lastCommitDate:', lastCommitDate, e);
    return 0;
  }
};

/**
 * Calculates a score for a library based on its metrics.
 * Uses log scaling for stars/downloads, linear for recency.
 * @param {object} libraryData Object containing library metrics 
 *        (githubStars, npmDownloadsLastMonth, lastCommit, githubOpenIssues).
 * @returns {number} Calculated score (aiming for ~0-100 range, but not guaranteed).
 */
const calculateScore = (libraryData) => {
  if (!libraryData) return 0;

  // --- Normalize Metrics (0-1 range) ---
  const normStars = normalizeLog(libraryData.githubStars, MAX_STARS_LOG);
  const normDownloads = normalizeLog(libraryData.npmDownloadsLastMonth, MAX_DOWNLOADS_LOG);
  const normRecency = normalizeRecency(libraryData.lastCommit, MAX_RECENCY_DAYS);
  
  // Issue ratio (lower is better) - normalize differently
  let normIssuePenalty = 0;
  if (libraryData.githubStars && libraryData.githubStars > 0 && libraryData.githubOpenIssues >= 0) {
    // Simple ratio: issues / stars. Cap penalty.
    // Example: 1000 issues / 100k stars = 0.01. 
    // A higher ratio means more penalty (lower score).
    // We want to scale this penalty (e.g., 0-1 range).
    // Let's say a 5% ratio (0.05) is a significant penalty.
    const issueRatio = libraryData.githubOpenIssues / libraryData.githubStars;
    normIssuePenalty = Math.min(issueRatio / 0.05, 1); // Capped penalty
  }

  // --- Apply Weights and Combine --- 
  // Weights should sum roughly to the desired scale (e.g., 100)
  const weightStars = 40;
  const weightDownloads = 30;
  const weightRecency = 20;
  const weightIssuePenalty = 10; // How much the issue ratio detracts

  let score = 
    (normStars * weightStars) + 
    (normDownloads * weightDownloads) + 
    (normRecency * weightRecency) - 
    (normIssuePenalty * weightIssuePenalty); // Subtract penalty

  // Ensure score is within a reasonable range (e.g., 0 to 100+)
  score = Math.max(0, score); // Ensure score is not negative

  // Optional: Round the score
  score = Math.round(score);

  return score;
};

module.exports = {
  calculateScore,
  // Export helpers if needed for testing or other services
  normalizeLinear,
  normalizeLog,
  normalizeRecency
}; 