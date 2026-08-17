const ResumeModel = require("../models/resume.model");
const fs = require("fs");
const pdfService = require("../services/pdf.service");
const aiResumePdf = require("../services/aiResumePdf.service")
const LOG_TAG = "(resumeAnalyze.controller)=>";
const geminiService = require("../services/gemini.service");
const ActivityModel = require("../models/activity.model");
const UserModel = require("../models/user.model");

async function getResumeController(req, res) {
  console.debug(
    LOG_TAG,
    " Entered into getResumeController: " + new Date().toISOString()
  );

  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication failed. Please login again.",
        success: false,
      });
    }

    const resume = await ResumeModel
      .findOne({ userId })
      .sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
        success: false,
      });
    }

    if (resume.status !== "analyzed") {
      return res.status(400).json({
        message: "Resume analysis is not completed yet.",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: resume,
    });

  } catch (err) {
    console.debug(LOG_TAG, err);

    return res.status(500).json({
      message: "Unable to fetch resume.",
      success: false,
    });

  } finally {
    console.debug(
      LOG_TAG,
      " Exited from getResumeController: " + new Date().toISOString()
    );
  }
}

async function deleteResumeController(req, res) {
  console.debug(LOG_TAG, " Entered into deleteResumeController: " + Date.now());
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(404).json({
        message: " please login again. Authentication failed",
        success: false,
      });
    }
    const existingResume = await ResumeModel.findOne({ userId: userId });
    if (!existingResume) {
      return res.status(404).json({
        message: "Resume not found",
        success: false,
      });
    }
    if (fs.existsSync(existingResume.filePath)) {
      fs.unlinkSync(existingResume.filePath);
    }
    const existingUser = await ResumeModel.findOneAndDelete({ userId: userId });

    if (!existingUser) {
      return res.status(400).json({
        message: " user not found",
        success: false,
      });
    }
    res.status(201).json({
      message: "Resume deleted successfully",
      success: true,
    });
  } catch (err) {
    console.debug(LOG_TAG, err);
    res.status(400).json({
      message: " unable to delete userData",
      success: false,
    });
  }
  console.debug(LOG_TAG, " Exited from deleteResumeController: " + Date.now());
}

async function analyzeResumeController(req, res) {
  console.debug(LOG_TAG ,
    " Entered into analyzeResumeController: " + new Date().toISOString());
  let savedResume;
  let userId;
  try {
    userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication failed. Please login again.",
        success: false,
      });
    }

    const userFileData = req.file;

    if (!userFileData) {
      return res.status(400).json({
        message: "Resume file is required.",
        success: false,
      });
    }

    if (!req.body.targetRole || req.body.targetRole.trim() === "") {
      if (fs.existsSync(userFileData.path)) {
        fs.unlinkSync(userFileData.path);
      }

      return res.status(400).json({
        message: "Target role is required.",
        success: false,
      });
    }  

    const existingResume = await ResumeModel.findOne({ userId });

    const resume = new ResumeModel({
      userId: userId,
      originalFileName: userFileData.originalname,
      storedFileName: userFileData.filename,
      filePath: userFileData.path,
      fileType: userFileData.mimetype,
      fileSize: userFileData.size,
      targetRole: req.body.targetRole,
      status: "uploaded",
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    });

    savedResume = await resume.save();

    const resumeText = await pdfService.extractText(savedResume.filePath);

    const geminiResponse = await geminiService.analyzeResume(
      resumeText,
      savedResume.targetRole,
    );

    const updatedResume = await ResumeModel.findOneAndUpdate(
      { _id: savedResume._id },
      {
        resumeText: resumeText,
        atsScore: geminiResponse.atsScore,
        summary: geminiResponse.summary,
        skills: geminiResponse.skills,
        missingSkills: geminiResponse.missingSkills,
        suggestions: geminiResponse.suggestions,
        status: "analyzed",
        modifiedAt: Date.now(),
      },
      {
        new: true,
      }
    );

    await UserModel.findByIdAndUpdate(userId, {
      $inc: {
        "stats.resumeAnalysisCount": 1
      },
      modifiedAt: Date.now()
    });

    await ActivityModel.create({
      userId: userId,
      type: "resume",
      title: "Resume analyzed",
      description: `ATS Score: ${updatedResume.atsScore}`,
      referenceId: updatedResume._id,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    });

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully.",
      analysis: updatedResume,
    });
  } catch (err) {
    console.debug(LOG_TAG, err);

    if (savedResume) {
      await ResumeModel.deleteOne({ _id: savedResume._id });
    }

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    await ResumeModel.findByIdAndUpdate(savedResume._id, {
      status: "failed",
      modifiedAt: Date.now()
     });

    return res.status(500).json({
      success: false,
      message: "Unable to analyze resume.",
    });
  }
}
  
async function generateOptimiziedResumeController(req,res){
  console.debug(LOG_TAG, " Entered into generateOptimiziedResume: "  + new Date().toISOString());
  try{
    const userId = req.user.id;
    if(!userId){
      return res.status(404).json({
        message : "unAuthorized please login",
        success : false
      })
    }

    const resumeModel = await ResumeModel.findOne({userId:userId}).sort({ createdAt: -1 });

    if(!resumeModel){
      return res.status(404).json({
        message : " Resume not found",
        success : false
      })
    }

    if(resumeModel.status != "analyzed"){
      return res.status(400).json({
        message : "Resume analysis is not completed yet.",
        success : false
      })
    }

    const optamiziedResume = await geminiService.optimizeResume(resumeModel.resumeText, resumeModel.targetRole, resumeModel.suggestions, resumeModel.missingSkills);

    if(!optamiziedResume){
      return res.status(500).json({
        message : " Server is buzy please try again",
        success : false
      })
    }
    const pdfPath = await aiResumePdf.generateAIResumePdf(optamiziedResume, userId);
    if(!pdfPath){
      return res.status(500).json({
        message : "resume generation failed",
        success : false
      })
    }

   return res.download(pdfPath, (err) => {
     if (err) {
        console.debug(LOG_TAG, err);
    }

    if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
    } 
    });

  }catch(error){
    res.status(500).json({
      message : "Generating optimized resume failed",
      success : false
    })
  }finally{
    console.debug(LOG_TAG, "Exited from generateIOptimiziedResumeController: " + new Date().toISOString())
  }
}

module.exports = {
  getResumeController,
  deleteResumeController,
  analyzeResumeController,
  generateOptimiziedResumeController
}
