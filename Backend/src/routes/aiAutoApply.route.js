const express = require("express");
const router = express.Router();
const auth_middleware = require("../middlewares/auth.middleware")
const aiAutoApplyController = require("../controllers/aiAutoApply.Controller")
const upload_middle = require("../middlewares/upload.middleware");

// Save the userData
router.post("/search", auth_middleware.authMiddleware,  upload_middle.single("autoApplyResume"), aiAutoApplyController.searchJobController);


module.exports = router