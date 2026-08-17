const profileModel = require("../models/profile.model");
const userModel = require("../models/user.model");
const LOG_TAG = "(profile.controller)=>";
const emailService = require("../services/email.service");

async function createProfileController(req, res) {
  console.debug( LOG_TAG, " Entered into createProfile POST method: " + new Date().toISOString());
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({
        message: " User authentication failed, Please login again",
        success: false,
      });
    }

    const { phoneNumber, collegeName, degree, branch, graduationYear } =
      req.body;

    if (!phoneNumber || !collegeName || !degree || !branch || !graduationYear) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
    }

    const existingProfile = await profileModel.findOne({ userId: userId });
    if (existingProfile) {
      return res.status(400).json({
        message: " Profile already exists for this user",
        success: false,
      });
    }

    var JsonData = new Object();
    JsonData.userId = userId;
    JsonData.phoneNumber = req.body.phoneNumber;
    JsonData.country = req.body.country;
    JsonData.collegeName = req.body.collegeName;
    JsonData.degree = req.body.degree;
    JsonData.branch = req.body.branch;
    JsonData.graduationYear = req.body.graduationYear;
    JsonData.skills = req.body.skills;
    JsonData.experience = req.body.experience;
    JsonData.githubProfile = req.body.githubProfile;
    JsonData.linkedinProfile = req.body.linkedinProfile;
    JsonData.bio = req.body.bio;
    JsonData.createdAt = Date.now();
    JsonData.modifiedAt = Date.now();
    const profileData = new profileModel(JsonData);
    const records = await profileData.save();
    console.debug(LOG_TAG, records);
    res.status(201).json({
      message: " Profile created successfully",
      success: true,
      data: records,
    });
  } catch (err) {
    console.error(LOG_TAG, err);
    res.status(500).json({
      message: " An error occurred while creating the profile",
      success: false,
    });
  }
}

async function getProfileController(req, res) {
  console.debug(LOG_TAG, " Entered into getProfileController GET method: " + new Date().toISOString());
  try {
    const userData = req.user;
    if (!userData) {
      return res.status(400).json({
        message: " User authentication failed, Please login again",
        success: false,
      });
    }
    const profileData = await profileModel.findOne({ userId: userData.id });

    if (!profileData) {
      return res.status(200).json({
        message: " Please create User Profile",
        success: false,
      });
    }

    res.status(200).json({
      message: {
        name: userData.name,
        email: userData.email,
        phoneNumber: profileData.phoneNumber,
        graduationYear: profileData.graduationYear,
        degree: profileData.degree,
        branch: profileData.branch,
        skills : profileData.skills
      },
      success: true,
    });
  } catch (err) {
    console.debug(LOG_TAG, err);
    res.status(400).json({
      message: " User Data not found",
      success: false,
    });
  }
}

async function updateProfileController(req, res) {
  console.debug(LOG_TAG,  " Entered updateProfileController: " + new Date().toISOString());
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(404).json({
        message: " User authentication failed, Please login again",
        success: false,
      });
    }
    var JsonData = new Object();
    JsonData.userId = userId;
    JsonData.phoneNumber = req.body.phoneNumber;
    JsonData.country = req.body.country;
    JsonData.collegeName = req.body.collegeName;
    JsonData.degree = req.body.degree;
    JsonData.branch = req.body.branch;
    JsonData.graduationYear = req.body.graduationYear;
    JsonData.skills = req.body.skills;
    JsonData.experience = req.body.experience;
    JsonData.githubProfile = req.body.githubProfile;
    JsonData.linkedinProfile = req.body.linkedinProfile;
    JsonData.bio = req.body.bio;
    JsonData.modifiedAt = Date.now();
    const records = await profileModel.findOneAndUpdate({userId: userId}, JsonData);
    res.status(200).json({
      message : " Profile updated successfully",
      success : true
    })

  } catch (err) {
   console.debug(  LOG_TAG + " Exited from updateProfileController: " + new Date().toISOString());
   res.status(400).json({
    message : " unable to update profile",
    success : false
  })}
}

async function deleteProfileController(req, res){
  console.debug(LOG_TAG, " Entered into deleteProfileController :" + new Date().toISOString());
  try{
    const userId = req.user.id;
    if(!userId){
      return res.status(404).json({
        message : " Profile not found",
        success : false
      })
    }

    const records = await profileModel.findOneAndDelete({userId:userId});
    res.status(200).json({
      message : " profile deleted successfully",
      success : true
    })
  }catch(err){
    console.error(LOG_TAG, err);
    res.status(400).json({
      message : " Profile not found",
      success : false
    })
  }
  console.debug(LOG_TAG, " Exited from deleteProfileController: " + new Date().toISOString());
}

module.exports = {
  createProfileController,
  updateProfileController,
  getProfileController,
  deleteProfileController
};

