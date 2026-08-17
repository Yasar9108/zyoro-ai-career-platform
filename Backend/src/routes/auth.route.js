const express = require("express");
const router = express.Router();
const auth_controller = require("../controllers/auth.controller");
const auth_middleware = require("../middlewares/auth.middleware");

// Register a new user 
router.post("/register", auth_controller.userRegistrationController);

// post methode for user login /zyoyoaiAgent/login
router.post("/login", auth_controller.userLoginController);

// post method for user logout /api/auth/logout
router.post("/logout", auth_middleware.authMiddleware, auth_controller.userLogoutController);

// post method for user forgot password /api/auth/forgot-password
router.post("/forgot-password", auth_controller.forgotPasswordController);

// post method for user verify-otp /api/auth/verify-otp
router.post("/verify-otp", auth_controller.verifyOtpController);

// post method for user reset-password /api/auth/reset-password
router.post("/reset-password", auth_controller.resetPasswordControllerr);

// get method for dahboard api/auth/dashboard
router.get("/dashboard", auth_middleware.authMiddleware, auth_controller.getDashboardController);

// get method for user profile /api/auth/myDetails
router.get("/me", auth_middleware.authMiddleware, auth_controller.getCurrentUserController);
module.exports = router;