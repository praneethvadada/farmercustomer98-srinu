const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
// const { authMiddleware } = require('../middleware/authMiddleware');
const authMiddleware = require("../middleware/authMiddleware");

// Debugging: Check if cartController is properly imported
console.log("🔍 Checking cartController:", cartController);
console.log("✅ Expected Functions:", {
    addToCart: typeof cartController.addToCart,
    getCart: typeof cartController.getCart,
    removeFromCart: typeof cartController.removeFromCart,
});

// ✅ Route: Add a product to cart
router.post('/add', authMiddleware, cartController.addToCart);

// ✅ Route: View cart items
router.get('/', authMiddleware, cartController.getCart);

// ✅ Route: Remove product from cart
router.delete('/remove/:product_id', authMiddleware, cartController.removeFromCart);

module.exports = router;
