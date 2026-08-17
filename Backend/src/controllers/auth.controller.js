const express = require("express");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const emailService = require("../services/email.service");
const userActivity = require("../models/activity.model");
const UserModel = require("../models/user.model");
const ActivityModel = require("../models/activity.model");
const LOG_TAG = "-->";

async function userRegistrationController(req, res){
    console.debug(LOG_TAG + " Entered userRegistrationController POST method : " + new Date().toISOString());
    try{
        const {name, email, password} = req.body;
        if(!name || !email || !password){
           return res.status(400).json({
                message : " Required fields are missing"
            })
        }
        const userExists = await userModel.findOne({email:email})
        if(userExists){
            return res.status(400).json({
                message : " User Already Exists"
            })
        }

        var jsonOBj = new Object();
        jsonOBj.name = name;
        jsonOBj.email = email;
        jsonOBj.password = password;
        jsonOBj.createdAt = Date.now();
        const userData = new userModel(jsonOBj);
        const records = await userData.save();
        console.debug(LOG_TAG, records)

        const token = jwt.sign({id:userData._id},process.env.JWT_SECRET, {expiresIn:"7d"});
        console.debug(LOG_TAG, " token is generated successfully : " + new Date().toISOString());
        res.cookie("token", token);
        await emailService.sendRegistrationEmail(records.email, records.name);

        res.status(201).json({
            message:  "User registered successfully."
        })
    }catch(err){
        console.error(err)
        res.status(400).json({
            message : "User registered unSuccessfully.",
            err : err
        })
    }
    console.debug(LOG_TAG, " Exited from userRegistrationcontroller post method: " + new Date().toISOString());
}

async function userLoginController(req, res){
    console.debug(LOG_TAG, " Entered into userLoginController: " + new Date().toISOString());
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                message : " Please Enter the required fields"
            })
        }
        const userExit = await userModel.findOne({email:email});

        if(!userExit){
            return res.status(400).json({
                message: " User Does not Exists"
            })
        }

        if(userExit){
            const isPasswordMatched = await userExit.comparePassword(password);
            if(!isPasswordMatched){
                return res.status(400).json({
                    message : " Invalid Password"
                })
            }
            const token = jwt.sign({id : userExit._id}, process.env.JWT_SECRET, {expiresIn: "7d"})
            console.debug(LOG_TAG, " token created succussfully:  " + new Date().toISOString());
            res.cookie("token",token);
            await emailService.sendLoginEmailAdmin(userExit.name);
            await emailService.sendLoginEmail(userExit.email, userExit.name);
            res.status(200).json({
                success: true,
                message: "User login successful",
                token
            })
        }
    }catch(err){
        res.status(400).json({
            message : " User Login unSuccessful"
        }
    )
        console.error(LOG_TAG, " error: " + err );
    }
    console.debug(LOG_TAG, " Exited from userLoginController post method :" + new Date().toISOString())
}

async function userLogoutController(req,res){
    try{
        console.debug(LOG_TAG, " Entered into userLogoutController: " + new Date().toISOString());
        res.clearCookie("token");
        await emailService.sendLoggedOutEmail(req.user.email, req.user.name);
        res.status(200).json({
            message: "User logged out successfully",
            success : true
        })
    }catch(err){
        console.error(LOG_TAG, " Error in userLogoutController: " + err);
        res.status(400).json({
            message : " user logged out unSuccessful",
            success : false
        })   
    }
    console.debug(LOG_TAG, " Exited from userLogoutController post method :" + new Date().toISOString())
}

async function getCurrentUserController(req, res){
    try{
        console.debug(LOG_TAG, " Entered into getCurrentUserController: " + new Date().toISOString());
        const userData = req.user;
        const user = await userModel.findById(userData.id);
        if(!userData){
            return res.status(401).json({
                message : " unAuthorized user access",
                success : false
            })
        }
        res.status(200).json({
            name : user.name,
            email : user.email,
            role : user.role,
            success : true
        })

    }catch(err){
        console.error(LOG_TAG, " Exited from getCurrentUserController: " + new Date().toISOString())
        res.status(500).json({
            message : " user data not found",
            success : false
        })
    }
}

async function forgotPasswordController(req, res){
    console.debug(LOG_TAG, " Entered into forgotPasswordController: " + new Date().toISOString())
    try{
        const email = req.body.email;

        if(!email){
            return res.status(400).json({
                message : "Please enter your email",
                success : false
            })
        }

        const user = await UserModel.findOne({
            email : email
        });


        if (!user) {
                return res.status(404).json({
                message: "Email not found",
               success: false
               });
        }

        const resetToken = jwt.sign({ id: user._id },process.env.RESET_PASSWORD_SECRET,{ expiresIn: "10m" });
        res.cookie("resetToken", resetToken);
        console.debug(LOG_TAG, " token created succussfully for resetPassword:  " + new Date().toISOString());

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await UserModel.findByIdAndUpdate(user._id,  {
                otp,
             otpExpiry
        })
        await emailService.sendOtpVerificationEmail(user.email, user.name, otp);

        res.status(200).json({
            message : "OTP sent successfully.",
            success : true
        })

    }catch(error){
        console.debug(LOG_TAG, error);
        res.status(500).json({
            message : "Internal Server Error",
            success : false
        })
    }
    console.debug(LOG_TAG, "Exited from forgotPasswordController : " + new Date().toISOString());
}

async function verifyOtpController(req, res){
    try{
        console.debug(LOG_TAG, " Entered into verifyOtpController : " + new Date().toISOString());
        const resetToken = req.cookies.resetToken;
        const {otp} = req.body;
        const decoded = jwt.verify(resetToken, process.env.RESET_PASSWORD_SECRET);
        if (!resetToken) {
            return res.status(401).json({
             message: "Reset session expired",
             success: false
            });
        }

        if(!otp){
            return res.status(400).json({
                message : "Please enter your otp",
                success : false
            })
        }
        const user = await UserModel.findOne({_id:decoded.id});

        if(!user){
            return res.status(404).json({
                message : "User not found",
                success : false
            })
        }

        if(new Date() > user.otpExpiry){
            return res.status(400).json({
                message : "Otp Has been expired",
                success : false
            })
        }

        if(user.otp !== otp ){
            return res.status(400).json({
                message : "Invalid OTP",
                success : false
            })
        }

        user.otpVerified = true;
        await user.save();

        res.status(200).json({
            message : "Otp verified successfully.",
            success : true
        })

    }catch(error){
        console.error(LOG_TAG, error);
        res.status(500).json({
            message : "Internal server error",
            success : false
        })

    }
}

async function resetPasswordControllerr(req, res){
       try{
        console.debug(LOG_TAG, "Entered into resetPasswordController: " + new Date().toISOString());
         const resetToken = req.cookies.resetToken;
         const resetPassword = req.body.password;
         const decoded = jwt.verify(resetToken, process.env.RESET_PASSWORD_SECRET);

        if(!resetToken) {
            return res.status(401).json({
            message: "Reset session expired",
            success: false
         });
        }

        if(!resetPassword){
            return res.status(400).json({
                message : "Password feild is required",
                success : false
            })
        }

        const user = await userModel.findOne({_id:decoded.id})

        if(!user){
            return res.status(404).json({
                message : "User not found",
                success : false
            })
        }

        if(!user.otpVerified){
            return res.status(400).json({
                message : "Please verify otp first",
                success : false
            })
        }

        user.password = resetPassword;
        user.otp = null;
        user.otpExpiry = null;
        user.modifiedAt = Date.now();
        user.otpVerified = false;
        await user.save();
        res.clearCookie("resetToken");

        res.status(200).json({
            message : "New Password has been updated",
            success : true
        })

       }catch(error){
        console.debug(LOG_TAG, error);
        res.status(500).json({
            message : "Internal Server Error",
            success : false
        })
       }
       console.debug(LOG_TAG, "Exited from resetPasswordController: " + new Date().toISOString());
}

async function getDashboardController(req,res){
    console.debug(LOG_TAG, "Entered into getDashBoardController: " + new Date().toISOString());
    try{
        const user = req.user;
        if(!user){
            return res.status(404).json({
                message : "Unauthorized user please login",
                success: false
            })
        }

        const userModel = await UserModel.findById(user.id);
        const activityModel = await ActivityModel.find({ userId: user.id }).sort({ createdAt: -1 }).limit(5);
        const jsonObj = {
                  name: userModel.name,
                  email: userModel.email,
                  subscription: userModel.subscription,
                  stats: userModel.stats,
                  recentActivities: activityModel
        };
        console.debug(jsonObj)

        res.status(200).json({
                 success: true,
                 message: "Dashboard fetched successfully.",
                 data: jsonObj
        });

    }catch(error){
        console.error(LOG_TAG, error);
        res.status(500).json({
            message : "Internal Server error",
            success: false
        })

    }
    console.debug(LOG_TAG, "Exited from getDashBoardController: " + new Date().toISOString());
}

module.exports ={
    userRegistrationController,
    userLoginController,
    userLogoutController,
    getCurrentUserController,
    forgotPasswordController,
    verifyOtpController,
    resetPasswordControllerr,
    getDashboardController
}
