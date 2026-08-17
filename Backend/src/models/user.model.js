const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, " Name is required"],
  },

  email: {
    type: String,
    unique: true,
    trim: true,
    required: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
  },

  password: {
    type: String,
    minlength: [6, " Password must be at least 6 characters "],
    required: [true, " password must require"],
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  otp:{
    type:String,
    default:null
  },

  otpExpiry:{
    type: Date,
    default : null
  },

  otpVerified:{
    type:Boolean,
    default :false
  },

  stats: {
  resumeAnalysisCount: {
    type: Number,
    default: 0
  },

  interviewCount: {
    type: Number,
    default: 0
  },

  jobsAppliedCount: {
    type: Number,
    default: 0
  }
 },

 subscription: {
    plan: {
        type: String,
        enum: ["Free", "Pro"],
        default: "Free"
    },
    status: {
        type: String,
        enum: ["Active", "Expired"],
        default: "Active"
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    }
  },

  createdAt:{
    type:Number
  },

  modifiedAt:{
    type:Number
  }
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  return;
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
