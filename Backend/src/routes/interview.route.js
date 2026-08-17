const express = require("express");

const interviewController = require("../controllers/interview.controller");
const middleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

// ============================================================
// Start Face-to-Face Interview
// ============================================================

router.post("/start",middleware.authMiddleware,upload.single("resume"),interviewController.startInterviewController);


// ============================================================
// Submit Interview Answer
// ============================================================

router.post("/:interviewId/answer",middleware.authMiddleware,interviewController.submitAnswerController);


// ============================================================
// End Interview
// ============================================================

router.post("/:interviewId/end", middleware.authMiddleware, interviewController.endInterviewController);

router.get("/:interviewId", middleware.authMiddleware, interviewController.getInterviewController);
// Get interview details

//End InterviewSection
router.post("/:interviewId/end", middleware.authMiddleware, interviewController.endInterviewController);
module.exports = router;