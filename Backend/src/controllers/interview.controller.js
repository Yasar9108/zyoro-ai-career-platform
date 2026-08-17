const fs = require("fs");
const pdfService = require("../services/pdf.service");
const interviewService = require("../services/interview.service");

const LOG_TAG = "(interview.controller)=>";


// ============================================================
// Start Interview
// ============================================================

async function startInterviewController(req, res) {
  console.debug(
    LOG_TAG,
    " Entered into startInterviewController: " + new Date().toISOString()
  );

  try {

    const userId = req.user.id;

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


    if (
      !req.body.experienceLevel ||
      req.body.experienceLevel.trim() === ""
    ) {

      if (fs.existsSync(userFileData.path)) {
        fs.unlinkSync(userFileData.path);
      }

      return res.status(400).json({
        message: "Experience level is required.",
        success: false,
      });
    }


    if (
      !req.body.interviewType ||
      req.body.interviewType.trim() === ""
    ) {

      if (fs.existsSync(userFileData.path)) {
        fs.unlinkSync(userFileData.path);
      }

      return res.status(400).json({
        message: "Interview type is required.",
        success: false,
      });
    }


    if (!req.body.duration) {

      if (fs.existsSync(userFileData.path)) {
        fs.unlinkSync(userFileData.path);
      }

      return res.status(400).json({
        message: "Interview duration is required.",
        success: false,
      });
    }


    // Extract resume text
    const resumeText =await pdfService.extractText(userFileData.path);


    // Start interview
    const interview =
      await interviewService.startInterview(

        userId,

        userFileData.originalname,

        resumeText,

        req.body.targetRole,

        req.body.targetCompany || "",

        req.body.experienceLevel,

        req.body.interviewType,

        req.body.difficulty || "Adaptive",

        Number(req.body.duration),

        req.body.language || "English"
      );


    // We only need resume text in MongoDB.
    // Delete uploaded physical file.
    if (fs.existsSync(userFileData.path)) {
      fs.unlinkSync(userFileData.path);
    }


    return res.status(201).json({

      message: "Interview started successfully.",

      success: true,

      interviewId: interview._id,

      currentDifficulty:
        interview.currentDifficulty,

      question:
        interview.conversations[0].question,

    });

  } catch (err) {

    console.debug(
      LOG_TAG,
      err
    );


    // Delete uploaded file if interview creation fails
    if (
      req.file &&
      fs.existsSync(req.file.path)
    ) {

      fs.unlinkSync(req.file.path);

    }


    return res.status(500).json({

      message:
        "Unable to start interview.",

      success: false,

    });

  } finally {

    console.debug(
      LOG_TAG,
      " Exited from startInterviewController: " +
        new Date().toISOString()
    );

  }
}


// ============================================================
// Submit Interview Answer
// ============================================================

async function submitAnswerController(req, res) {

  console.debug(
    LOG_TAG,
    " Entered into submitAnswerController: " +
      new Date().toISOString()
  );

  try {

    const userId = req.user.id;

    if (!userId) {

      return res.status(401).json({

        message:
          "User authentication failed. Please login again.",

        success: false,

      });

    }


    const interviewId =
      req.params.interviewId;


    if (!interviewId) {

      return res.status(400).json({

        message:
          "Interview id is required.",

        success: false,

      });

    }


    if (
      !req.body.answer ||
      req.body.answer.trim() === ""
    ) {

      return res.status(400).json({

        message:
          "Interview answer is required.",

        success: false,

      });

    }


    const result =
      await interviewService.submitAnswer(

        userId,

        interviewId,

        req.body.answer

      );


    return res.status(200).json({

      message:
        "Answer submitted successfully.",

      success: true,

      interview: result,

    });

  } catch (err) {

    console.debug(
      LOG_TAG,
      err
    );


    return res.status(500).json({

      message:
        "Unable to submit interview answer.",

      success: false,

    });

  } finally {

    console.debug(
      LOG_TAG,
      " Exited from submitAnswerController: " +
        new Date().toISOString()
    );

  }
}


// ============================================================
// End Interview
// ============================================================

// ============================================================
// End Interview
// ============================================================

async function endInterviewController(req, res) {

  console.debug(
    LOG_TAG,
    " Entered into endInterviewController: " +
      new Date().toISOString()
  );


  try {

    // ==========================================================
    // User
    // ==========================================================

    const userId =
      req.user.id;


    if (!userId) {

      return res.status(401).json({

        message:
          "User authentication failed. Please login again.",

        success: false,

      });

    }

    // ==========================================================
    // Interview ID
    // ==========================================================

    const interviewId =
      req.params.interviewId;


    if (!interviewId) {

      return res.status(400).json({

        message:
          "Interview id is required.",

        success: false,

      });

    }


    // ==========================================================
    // Analytics From Frontend
    // ==========================================================

    const speakingAnalytics =
      req.body.speakingAnalytics ? req.body.speakingAnalytics : {};


    const presentationAnalytics =
      req.body.presentationAnalytics ? req.body.presentationAnalytics : {};


    console.debug(
      LOG_TAG,
      " Speaking analytics received:",
      speakingAnalytics
    );


    console.debug(
      LOG_TAG,
      " Presentation analytics received:",
      presentationAnalytics
    );


    // ==========================================================
    // End Interview
    // ==========================================================

    const result =
      await interviewService.endInterview(

        userId,

        interviewId,

        speakingAnalytics,

        presentationAnalytics

      );


    // ==========================================================
    // Response
    // ==========================================================

    return res.status(200).json({

      message:
        "Interview completed successfully.",

      success: true,

      report:
        result,

    });


  } catch (err) {

    console.debug(
      LOG_TAG,
      err
    );


    return res.status(500).json({

      message:
        err.message ||
        "Unable to complete interview.",

      success: false,

    });


  } finally {

    console.debug(
      LOG_TAG,
      " Exited from endInterviewController: " +
        new Date().toISOString()
    );

  }

}

async function getInterviewController(req, res) {

  console.debug(LOG_TAG, " Entered into getInterviewController: " + new Date().toISOString());

  try {

    const userId = req.user.id;
    const interviewId = req.params.interviewId;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication failed. Please login again.",
        success: false,
      });
    }

    if (!interviewId) {
      return res.status(400).json({
        message: "Interview id is required.",
        success: false,
      });
    }

    const interview = await interviewService.getInterview(
        userId,
        interviewId
      );

    return res.status(200).json({
      message: "Interview fetched successfully.",
      success: true,
      interview: interview,
    });

  } catch (err) {
    console.debug(LOG_TAG, err);
    return res.status(500).json({
      message: "Unable to fetch interview.",
      success: false,
    });

  } finally {

    console.debug( LOG_TAG,
      " Exited from getInterviewController: " +
        new Date().toISOString()
    );

  }
}


// ============================================================
// Exports
// ============================================================

module.exports = {

  startInterviewController,

  submitAnswerController,

  endInterviewController,

  getInterviewController

};