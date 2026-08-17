const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  resume: {
    fileName: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String,
      required: true,
    },
  },

  targetRole: {
    type: String,
    required: true,
    trim: true,
  },

  targetCompany: {
    type: String,
    trim: true,
    default: "",
  },

  experienceLevel: {
    type: String,
    required: true,
  },

  interviewType: {
    type: String,
    enum: ["Technical", "HR", "Mixed"],
    required: true,
  },

  difficulty: {
    type: String,
    enum: ["Adaptive", "Easy", "Medium", "Hard"],
    default: "Adaptive",
  },

  currentDifficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },

  duration: {
    type: Number,
    required: true,
  },

  language: {
    type: String,
    default: "English",
  },

  status: {
    type: String,
    enum: ["In Progress", "Completed"],
    default: "In Progress",
  },

  conversations: [
    {
      question: {
        type: String,
        required: true,
      },

      answer: {
        type: String,
        default: "",
      },

      technicalScore: {
        type: Number,
        default: null,
      },

      communicationScore: {
        type: Number,
        default: null,
      },

      feedback: {
        type: String,
        default: "",
      },

      difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Medium",
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  finalReport: {
    overallScore: {
      type: Number,
      default: null,
    },

    technicalScore: {
      type: Number,
      default: null,
    },

    communicationScore: {
      type: Number,
      default: null,
    },

    strengths: [{
      type: String,
    }],

    weaknesses: [{
      type: String,
    }],

    topicsToImprove: [{
      type: String,
    }],

    finalFeedback: {
      type: String,
      default: "",
    },
  },

  speakingAnalytics: {

    totalAnswers: {
        type: Number,
        default: 0
    },

    totalWords: {
        type: Number,
        default: 0
    },

    fillerWordCount: {
        type: Number,
        default: 0
    },

    fillerWords: {
        type: Object,
        default: {}
    },

    longPauseCount: {
        type: Number,
        default: 0
    },

    speakingDurationSeconds: {
        type: Number,
        default: 0
    },

    wordsPerMinute: {
        type: Number,
        default: 0
    }

},

   presentationAnalytics: {

    faceDetectedPercent: {
        type: Number,
        default: 0
    },

    lookingAtCameraPercent: {
        type: Number,
        default: 0
    },

    faceMissingCount: {
        type: Number,
        default: 0
    },

    lookingAwayCount: {
        type: Number,
        default: 0
    }

  },

  startedAt: {
    type: Date,
    default: Date.now,
  },

  completedAt: {
    type: Date,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  modifiedAt: {
    type: Date,
    default: Date.now,
  },
});

const InterviewSession = mongoose.model(
  "InterviewSession",
  interviewSessionSchema
);

module.exports = InterviewSession;