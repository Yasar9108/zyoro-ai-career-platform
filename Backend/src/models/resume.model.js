const mongoose = require("mongoose");

const resumeAnalyzeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  originalFileName: {
    type: String,
    required : true
  },

  storedFileName: {
    type: String,
    required : true
  },

  filePath: {
    type: String,
    required : true
  },

  fileType: {
    type: String,
    required: true,
    enum: ["application/pdf"]
  },

  fileSize: {
    type: Number,
  },

  targetRole: {
    type: String,
  },

  resumeText: {
    type: String,
  },

  atsScore: {
    type: Number,
  },

  summary: {
    type: String,
  },

  skills: {
    type: [String],
    default: [],
  },

  missingSkills: {
    type: [String],
  },

  suggestions: {
    type: [String],
  },

  status: {
    type: String,
    enum: [
        "uploaded",
        "analyzed",
        "pending",
        "failed"
    ],
    default: "pending"
  },

  createdAt: {
    type: Number,
  },

  modifiedAt: {
    type: Number,
  },
});


const resumeAnalyzeModel = mongoose.model("ResumeAnalyze", resumeAnalyzeSchema);

module.exports = resumeAnalyzeModel;