const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const LOG_TAG = "(middleware)=>"

async function authMiddleware(req, res, next){
    try{
        console.debug(LOG_TAG," Entered auth middleware" + new Date().toISOString());
        const token = req.cookies.token;
        console.debug(LOG_TAG, "Token received from cookies");
        if(!token){
            return res.status(400).json({
                message : " Unauthorized Access"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userData = await userModel.findById(decoded.id);   
        if(!userData){
            return res.status(400).json({
                message : " Unauthorized Access"
            })
        }     
        req.user = userData;
        return next();
    }catch(err){
        console.error(LOG_TAG, err);
        return res.status(500).json({
            message : " internal server error"
        })
    }
    console.debug(LOG_TAG, " Exited from auth middleware : " + new Date().toISOString());
}

module.exports = {
    authMiddleware
}