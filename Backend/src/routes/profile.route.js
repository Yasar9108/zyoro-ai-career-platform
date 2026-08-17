const express = require("express");
const router = express.Router();
const profile_controller = require("../controllers/profile.controller");
const auth_middleware = require("../middlewares/auth.middleware")

// post method for creating user profile /api/profile/create
router.post("/create", auth_middleware.authMiddleware, profile_controller.createProfileController);

// get method for fetching user profile /api/profile/fetch
router.get("/fetch", auth_middleware.authMiddleware, profile_controller.getProfileController);

// patch method for updating user profile /api/profile/update
router.patch("/update", auth_middleware.authMiddleware, profile_controller.updateProfileController);

// delete method for deleting user profile /api/profile/delete
router.delete("/delete", auth_middleware.authMiddleware, profile_controller.deleteProfileController);

module.exports = router;