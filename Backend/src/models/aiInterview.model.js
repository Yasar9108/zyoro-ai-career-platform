const mongoose = require("mongoose");

const aiInterviewSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : [true, "user id is required"] 
    },

    targetRole:{
        type: String,
        required : [true, "targetRole is required"]
    },

    companyType:{
        type:String,
        required: [true, "comapnyType is required"]
    },

    experienceLevel:{
        type : String,
        required :[true, "experienceLevel is required"]
    },

    companyName:{
        type:String,
    },

    status:{
        type: String,
        enum :["Pending", "Generated"],
        default : "Pending"
    },

    createdAt:{
        type:Number
    },

    modifiedAt:{
        type:Number
    }
})

const aiInterviewModel = mongoose.model("AiInterview", aiInterviewSchema);
module.exports = aiInterviewModel