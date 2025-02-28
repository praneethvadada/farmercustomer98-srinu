const express = require("express");
const { register, login } = require("../controllers/authController");
const { uploadProfileImage } = require("../config/multer");

const router = express.Router();

router.post("/register", uploadProfileImage.single("profile_image"), register);
router.post("/login", login);

module.exports = router;

// const express = require("express");
// const { register, login } = require("../controllers/authController");
// const upload = require("../config/multer");

// const router = express.Router();

// router.post("/register", upload.single("profile_image"), register);
// router.post("/login", login);

// module.exports = router;
