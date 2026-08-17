const axios = require("axios");
const LOG_TAG = "(adzuna.service)=>";

async function searchJobs(
  targetRole,
  location,
  experienceLevel,
  jobType,
  companyType,
  workMode,
  countryName
) {
  console.debug(LOG_TAG, "Entered into searchJobs: " + new Date().toISOString());

  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      throw new Error("Adzuna API credentials are missing");
    }

    const country = countryName ? countryName : "in";

    const url =
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1` +
      `?app_id=${appId}` +
      `&app_key=${appKey}` +
      `&results_per_page=20` +
      `&what=${encodeURIComponent(targetRole)}` +
      `&where=${encodeURIComponent(location || "")}`;

    console.debug(LOG_TAG, "Searching jobs from Adzuna");

    const response = await axios.get(url);

    if (!response.data || !response.data.results) {
      return [];
    }

    return response.data.results;

  } catch (err) {
    console.error(LOG_TAG, err);
    throw err;
  }
}

module.exports = {
  searchJobs
};