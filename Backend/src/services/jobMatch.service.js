const LOG_TAG = "(jobMatch.service)=>";
const jobMatchModel = require("../models/jobMatch.model");

async function saveMatchedJobs(searchId, matchedJobs) {
  console.debug(LOG_TAG, "Entered into saveMatchedJobs: " + new Date().toISOString());
  try {
    const jobsToSave = [];

    for (const job of matchedJobs) {
      var jsonObject = new Object();
      jsonObject.searchId = searchId;
      jsonObject.jobTitle = job.jobTitle;
      jsonObject.company = job.company;
      jsonObject.location = job.location;
      jsonObject.salaryMin = job.salaryMin;
      jsonObject.salaryMax = job.salaryMax;
      jsonObject.applyUrl = job.applyUrl;
      jsonObject.matchScore = job.matchScore;
      jsonObject.matchingSkills = job.matchingSkills;
      jsonObject.missingSkills = job.missingSkills;
      jsonObject.reason = job.reason;
      jsonObject.selected = job.selected;
      jsonObject.status = "Pending";
      jsonObject.createdAt = Date.now();
      jsonObject.modifiedAt = Date.now();
      jobsToSave.push(jsonObject);
    }

    const savedJobs = await jobMatchModel.insertMany(jobsToSave);
    console.debug(LOG_TAG, "Matched jobs saved successfully");
    return savedJobs;
  } catch (err) {
    console.error(LOG_TAG, err);
    throw err;
  } finally {
    console.debug(LOG_TAG, "Exited from saveMatchedJobs: " + new Date().toISOString())
  }
}

module.exports = {
  saveMatchedJobs,
};