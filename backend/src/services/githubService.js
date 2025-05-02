const axios = require('axios');

// Function to parse owner and repo from various GitHub URL formats
const parseGithubUrl = (url) => {
  if (!url) return null;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== 'github.com') return null;
    const pathParts = parsedUrl.pathname.split('/').filter(part => part);
    if (pathParts.length >= 2) {
      // Remove potential .git suffix
      const repo = pathParts[1].replace(/\.git$/, '');
      return { owner: pathParts[0], repo };
    }
  } catch (e) { /* Ignore URL parsing errors */ }
  return null;
};

const getGithubData = async (repoUrl) => {
  const repoInfo = parseGithubUrl(repoUrl);
  if (!repoInfo) {
    console.warn(`Could not parse GitHub URL: ${repoUrl}`);
    return {};
  }

  const { owner, repo } = repoInfo;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const githubPat = process.env.GITHUB_PAT;

  console.log(`Fetching live GitHub data for: ${owner}/${repo}`);

  const headers = {};
  if (githubPat) {
    headers.Authorization = `token ${githubPat}`;
    console.log('Using GitHub PAT for request.');
  } else {
    console.warn('GITHUB_PAT not found in .env. Making unauthenticated request (may hit rate limits).');
  }

  try {
    const response = await axios.get(apiUrl, { headers });
    const data = response.data;

    return {
      githubStars: data.stargazers_count,
      githubForks: data.forks_count,
      githubOpenIssues: data.open_issues_count,
      lastCommit: data.pushed_at ? new Date(data.pushed_at) : null,
      license: data.license?.spdx_id || data.license?.name || null, // Prefer SPDX ID
      description: data.description,
      // Add other fields if needed
    };
  } catch (error) {
    console.error(`Error fetching GitHub data for ${owner}/${repo}:`, error.response?.data || error.message);
    if (error.response?.status === 404) {
        console.warn(`Repository not found on GitHub: ${owner}/${repo}`);
    }
    if (error.response?.status === 403 || error.response?.status === 429) {
        console.warn(`GitHub API rate limit hit or forbidden access for ${owner}/${repo}. Check GITHUB_PAT.`);
    }
    // Return empty to avoid breaking comparison
    return {}; 
  }
};

module.exports = {
  getGithubData,
  parseGithubUrl // Export parser if needed elsewhere
};
