const mongoose = require("mongoose");

const jobMatchSchema = new mongoose.Schema({
  searchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AiAutoApply",
    required: true
  },

  jobTitle: {
    type: String,
    required: false
  },

  company: {
    type: String,
    required : false
  },

  location: {
    type: String,
    required: false
  },

  salaryMin: {
    type: Number
  },

  salaryMax: {
    type: Number
  },

  applyUrl: {
    type: String,
    required: false
  },

  matchScore: {
    type: Number,
    required: false
  },

  matchingSkills: {
    type: [String],
    default: []
  },

  missingSkills: {
    type: [String],
    default: ["No missing skills found"]
  },

  reason: {
    type: String
  },

  selected: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: ["Pending", "Applying", "Applied",  "Interview", "Rejected", "Offer", "Failed"],
    default: "Pending"
  },

  createdAt: {
    type: Number
  },

  modifiedAt: {
    type: Number
  }
});

const aiJobMatchModel = mongoose.model("JobMatch", jobMatchSchema);
module.exports = aiJobMatchModel;
