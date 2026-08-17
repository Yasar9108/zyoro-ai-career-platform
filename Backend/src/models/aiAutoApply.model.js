const mongoose = require("mongoose")
const aiAutoApplySchema = new mongoose.Schema({
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    targetRole:{
        type:String,
        required : true
    },
    resumePath:{
        type: String,
        required : [true, " resume is required"]
    },
    experienceLevel:{
        type:String,
        required:true
    },
    location:{
        type : String,
    },
    jobType:{
        type:String,
        enum:["Full-Type", "Part-Time", "Internship", "Contract", "Freelance"],
        default : "Full-Type"
    },
    workMode:{
        type : String,
        enum :["Hybrid", "Remote", "Onsite"],
        default : "Onsite"
    },
    companyType:{
        type : String,
        enum :[ "Product Based", "Startup", "Service Based", "All" ],
        required : true,
        default : "All"
    },
    country:{
        type : String
    },
    status:{
        type : String,
        enum:["Pending" ,"Searching" ,"Matched" ,"Applying" ,"Completed", "Failed"],
        required : true,
        default : "Pending"
    },
    createdAt :{
        type : Number
    },
    modifiedAt:{
        type:Number
    }
})

const aiAutoApplyModel = mongoose.model("AiAutoApply", aiAutoApplySchema);
module.exports = aiAutoApplyModel;