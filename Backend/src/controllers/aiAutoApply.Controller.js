const aiAutoApplyModel = require("../models/aiAutoApply.model");
const LOG_TAG = "(aiAutoApplyComtroller)=>";
const extractFile = require("../services/pdf.service");
const adzunaService = require("../services/adzuna.service");
const geminiService = require("../services/gemini.service");
const jobMatchService = require("../services/jobMatch.service");
const fs = require("fs");

async function searchJobController(req, res) {
  console.debug(LOG_TAG, " Entered into searchJobController: " + new Date().toISOString());
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(404).json({
        message: "unAuthorized User, Please Login again",
        success: false,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: " file not found",
        success: false,
      });
    }

    if (!req.body.targetRole || !req.body.experienceLevel) {
      return res.status(400).json({
        message: "required fields are missing",
        success: false,
      });
    }

    var jsonObj = new Object();
    jsonObj.userId = userId;
    jsonObj.targetRole = req.body.targetRole;
    jsonObj.experienceLevel = req.body.experienceLevel;
    jsonObj.resumePath = req.file.path;
    jsonObj.jobType = req.body.jobType;
    jsonObj.workMode = req.body.workMode;
    jsonObj.companyType = req.body.companyType;
    jsonObj.status = "Searching";
    jsonObj.location = req.body.location;
    jsonObj.createdAt = Date.now();
    jsonObj.modifiedAt = Date.now();

    const records = new aiAutoApplyModel(jsonObj);
    const savedSearch = await records.save();
    const extractedResumeText = await extractFile.extractText(req.file.path);
    const jobs = await adzunaService.searchJobs(
      req.body.targetRole,
      req.body.location,
      req.body.experienceLevel,
      req.body.jobType,
      req.body.companyType,
      req.body.workMode,
      req.body.country
    );
    if (!jobs || jobs.length == 0) {
      await aiAutoApplyModel.findByIdAndUpdate(savedSearch._id, {
        status: "Failed",
        modifiedAt: Date.now(),
      });

      return res.status(400).json({
        message: " No Jobs found",
        success: false,
      });
    }
    const matchedJob = await geminiService.calculateJobMatch(
      extractedResumeText,
      jobs,
    );

    if (!matchedJob || matchedJob.length == 0) {
      await aiAutoApplyModel.findByIdAndUpdate(savedSearch._id, {
        status: "Failed",
        modifiedAt: Date.now(),
      });
      return res.status(404).json({
        message: " No Matching job found",
        success: false,
      });
    }

    const savedMatchedJobs = await jobMatchService.saveMatchedJobs(
      savedSearch._id,
      matchedJob,
    );

    if (savedMatchedJobs.length > 0) {
      await aiAutoApplyModel.findByIdAndUpdate(savedSearch._id, {
        status: "Matched",
        modifiedAt: Date.now(),
      });

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.debug(LOG_TAG, "Uploaded resume deleted.");
      }

      return res.status(200).json({
        message: "Jobs searched successfully",
        success: true,
        totalJobs: savedMatchedJobs.length,
        data: savedMatchedJobs,
      });
    }
  } catch (err) {
    console.debug(LOG_TAG, " error: ", err);
    res.status(400).json({
      message: " searchJobController function is failed",
      success: false,
    });
  }
}

module.exports = {
  searchJobController
};
