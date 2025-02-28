
const express = require("express");
const { addProduct, getAllProducts, getFarmerProducts, getProduct, updateProduct, deleteProduct, advancedSearchProducts } = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require('multer');
const router = express.Router();
console.log("✅ Expected Functions:", {
    addProduct: typeof addProduct,
    getAllProducts: typeof getAllProducts
});
// ✅ Set up storage for uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure 'uploads/' folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Rename file with timestamp
    }
});

// ✅ Filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'), false);
    }
};



// ✅ Configure multer to accept a single file with the correct field name
const upload = multer({ storage, fileFilter });
router.post('/add', authMiddleware, upload.single('image_file'), addProduct);
router.get("/all", authMiddleware, getAllProducts);

router.get("/my-products", authMiddleware, getFarmerProducts);
router.get("/:id", getProduct);
router.put("/update/:id", authMiddleware, upload.single("image_file"), updateProduct); // ✅ Added multer for PUT request

router.delete("/delete/:id", authMiddleware, deleteProduct);
router.get('/all', authMiddleware, getAllProducts);


router.get("/search", advancedSearchProducts);

module.exports = router;
