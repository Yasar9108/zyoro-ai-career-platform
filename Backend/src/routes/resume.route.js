const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resume.controller");
const uploadMiddleware = require("../middlewares/upload.middleware")
const authMiddleware = require("../middlewares/auth.middleware");
// // create post method to save data
// router.post("/upload", authMiddleware.authMiddleware, uploadMiddleware.single("resume"), resumeController.createResumeController);

// create get method to get data
router.get("/get", authMiddleware.authMiddleware, resumeController.getResumeController);

// delete method to delete data
router.delete("/delete", authMiddleware.authMiddleware, resumeController.deleteResumeController);

// analyze resume 
router.post("/analyze", authMiddleware.authMiddleware, uploadMiddleware.single("resume"), resumeController.analyzeResumeController);

// genarate aiResume
router.post("/generate", authMiddleware.authMiddleware, resumeController.generateOptimiziedResumeController);

module.exports =
    router
