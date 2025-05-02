const axios = require('axios'); // We might need axios later

const getNpmData = async (packageName) => {
  if (!packageName) {
    return {}; // Return empty if no package name
  }
  console.log(`Fetching live NPM data for: ${packageName}`);
  try {
    // Fetch main package data (includes version, license, description)
    const packageUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
    const packageResponse = await axios.get(packageUrl);
    const latestVersion = packageResponse.data['dist-tags']?.latest;
    const packageData = latestVersion ? packageResponse.data.versions[latestVersion] : {};

    // Fetch download data (last month)
    const downloadsUrl = `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(packageName)}`;
    let downloadsLastMonth = 0;
    try {
        const downloadsResponse = await axios.get(downloadsUrl);
        downloadsLastMonth = downloadsResponse.data.downloads || 0;
    } catch (downloadError) {
        // Ignore download fetch errors (e.g., package just published, no download data yet)
        console.warn(`Could not fetch NPM download count for ${packageName}: ${downloadError.message}`);
    }

    return {
      version: latestVersion || packageData.version,
      license: packageData.license, 
      description: packageData.description,
      npmDownloadsLastMonth: downloadsLastMonth,
      // Add other fields if needed
    };

  } catch (error) {
    console.error(`Error fetching NPM data for ${packageName}:`, error.response?.data || error.message);
    // Decide how to handle: throw error, return partial, return empty?
    // Returning empty for now to avoid breaking comparison if one package fails
    return {}; 
  }
};

module.exports = {
  getNpmData
};
