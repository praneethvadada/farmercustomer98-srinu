const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");

// ✅ Get Profile Details (Authenticated User)
router.get("/", authMiddleware, profileController.getProfile);

// ✅ Update Profile Details (Authenticated User)
router.put("/", authMiddleware, profileController.updateProfile);

// ✅ Change Password (Authenticated User)
router.put("/password", authMiddleware, profileController.changePassword);

module.exports = router;
