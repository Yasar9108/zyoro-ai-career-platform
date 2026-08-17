const mongoose = require("mongoose");

const activitySchema =new  mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    type: {
        type: String,
        enum: [
            "resume",
            "mock_interview",
            "face_to_face_interview",
            "job_application",
            "subscription"
        ],
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        default: ""
    },
    
    referenceId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },

    createdAt: {
        type: Number
    },

    modifiedAt: {
        type: Number
    }

})

const ActivityModel = mongoose.model("Activity", activitySchema);

module.exports = ActivityModel;