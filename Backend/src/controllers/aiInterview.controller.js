const aiInterviewModel = require("../models/aiInterview.model");
const geminiService = require("../services/gemini.service");
const pdfService = require("../services/pdf.service");
const emailService = require("../services/email.service");
const pdfDocument = require("../services/interviewpdf.service");
const fs = require("fs");
const LOG_TAG = "(aiInterviewController=>)";

async function generateAiInterviewController(req, res) {
  console.debug(
    LOG_TAG,
    " Entered into generateAiInterviewController: " + new Date().toISOString()
  );
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(404).json({
        message: " Authentication failed, please login again",
        success: false,
      });
    }
    const resumeFile = req.file;
    if (!resumeFile) {
      return res.status(400).json({
        message: " resume has been not uploaded please upload resume",
      });
    }

    if (
      !req.body.targetRole ||
      !req.body.companyType ||
      !req.body.experienceLevel
    ) {
      return res.status(400).json({
        message:
          " please fill the required fields, required fields are missing",
        success: false,
      });
    }

    var jsonObject = new Object();
    jsonObject.userId = userId;
    jsonObject.experienceLevel = req.body.experienceLevel;
    jsonObject.targetRole = req.body.targetRole;
    jsonObject.companyType = req.body.companyType;
    jsonObject.companyName = req.body.companyName
      ? req.body.companyName
      : "null";
    jsonObject.createdAt = Date.now();
    jsonObject.modifiedAt = Date.now();
    const records = new aiInterviewModel(jsonObject);
    const saveRecords = await records.save();

    const resumeText = await pdfService.extractText(req.file.path);
    const geminiResponse = await geminiService.generateInterviewQuestions(
      resumeText,
      req.body.targetRole,
      req.body.companyType,
      req.body.experienceLevel,
      req.body.companyName,
    );
    const pdfPath = await pdfDocument.generateInterviewPdf(
      geminiResponse,
      req.body.targetRole,
      req.body.companyType,
      req.body.experienceLevel,
      req.body.companyName,
    );

    await aiInterviewModel.updateOne(
      { userId: userId },
      {
        status: "Generated",
        modifiedAt: Date.now(),
      },
    );

    res.download(pdfPath, (err) => {
      try {
        if (err) {
          console.error(LOG_TAG, "Error while downloading PDF:", err);
          return;
        }

        // Delete generated interview PDF
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
          console.debug(LOG_TAG, "Generated interview PDF deleted.");
        }

        // Delete uploaded resume
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.debug(LOG_TAG, "Uploaded resume deleted.");
        }
      } catch (error) {
        console.error(LOG_TAG, "Error while cleaning temporary files:", error);
      }
    });
  } catch (err) {
    console.debug(LOG_TAG, err);
    res.status(400).json({
      message: " error",
      success: false,
    });
  }
}

async function getAiInterviewController(req, res) {}

async function deleteAiInterviewController(req, res) {}

module.exports ={
  generateAiInterviewController
}