const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({

    userId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
        unique : true
    },

    phoneNumber: {
       type: String,
       required: true,
       match: [/^\d{10}$/, "Phone number must contain exactly 10 digits"]
    },

    country:{
        type : String,
        required : true
    },

    collegeName :{
        type : String,
        required : true
    },

    degree:{
        type : String,
        required : true
    },

    branch:{
        type: String,
        required : [true , "Branch is required"]
    },

    graduationYear:{
        type : Number,
        required : true
    },
    
    skills: {
       type: [String],
       default: []
   },

    experience:{
        type:Number,
        default: 0
    },

    githubProfile:{
        type : String,
        trim : true,
        match : [/^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_-]+$/, "Please enter a valid GitHub profile URL"]
    },

    linkedinProfile:{
        type : String,
        trim : true,
        match : [/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+$/, "Please enter a valid LinkedIn profile URL"]
    },

    portfolio:{
        type : String
    },

    bio:{
        type : String,
        maxlength: 500
    },

    createdAt:{
        type: Number
    },

    modifiedAt:{
        type:Number
    }

})

const  ProfileModel = mongoose.model("Profile", userProfileSchema);

module.exports = ProfileModel;