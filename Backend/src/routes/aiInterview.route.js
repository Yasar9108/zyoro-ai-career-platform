const express = require("express");
const auth_middleware = require("../middlewares/auth.middleware");
const upload_resume = require("../middlewares/upload.middleware");
const aiInterview_Controller = require("../controllers/aiInterview.controller");
const router = express.Router();

router.post("/generate", auth_middleware.authMiddleware, upload_resume.single("resume"), aiInterview_Controller.generateAiInterviewController);

module.exports = router