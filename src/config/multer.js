const multer = require("multer");
const path = require("path");

const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/profiles/"); // Separate folder for profile images
    },
    filename: (req, file, cb) => {
        cb(null, "profile-" + Date.now() + path.extname(file.originalname));
    }
});

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/products/"); // Separate folder for product images
    },
    filename: (req, file, cb) => {
        cb(null, "product-" + Date.now() + path.extname(file.originalname));
    }
});

// File filter to allow only images (JPG, PNG, JPEG)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPG, JPEG, and PNG are allowed."), false);
    }
};

const uploadProfileImage = multer({ storage: profileStorage, fileFilter });
const uploadProductImage = multer({ storage: productStorage, fileFilter });

module.exports = { uploadProfileImage, uploadProductImage };

// const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/");
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage });

// module.exports = upload;
