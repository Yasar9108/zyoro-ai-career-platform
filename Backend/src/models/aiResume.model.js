const mongoose = require("mongoose");

const aiResumeSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ResumeAnalyze",
        required: true
    },

    targetRole: {
        type: String,
        required: true
    },

    summary: {
        type: String,
        default: ""
    },

    skills: {
        type: [String],
        default: []
    },

    experience: [
        {
            company: String,
            role: String,
            duration: String,
            description: [String]
        }
    ],

    education: [
        {
            institution: String,
            degree: String,
            year: String
        }
    ],

    projects: [
        {
            title: String,
            description: String,
            technologies: [String]
        }
    ],

    certifications: [
        {
            name: String,
            organization: String
        }
    ],

    pdfPath: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ["generated", "downloaded"],
        default: "generated"
    },

    createdAt: {
        type: Number,
        default: Date.now
    },

    modifiedAt: {
        type: Number,
        default: Date.now
    }

});
const AiResumeModel  = mongoose.model("AIResume", aiResumeSchema);
module.exports = AiResumeModel;