const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const agriRoutes = require('./routes/agriRoutes');
const profileRoutes = require("./routes/profileRoutes"); // 🆕 Import Profile Routes


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true })); // For form data

// Debugging: Log ALL incoming requests
app.use((req, res, next) => {
    console.log(`✅ Incoming Request: ${req.method} ${req.url}`);
    next();
});

// Register routes
console.log("✅ Registering routes...");
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/profile", profileRoutes); // 🆕 Profile Routes Added
console.log("✅ Routes registered: /api/auth, /api/products");
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/agri', agriRoutes);
// Debugging: Catch all unmatched routes
app.use((req, res, next) => {
    console.warn(`🚨 No route found for ${req.method} ${req.url}`);
    res.status(404).json({ message: "Route not found" });
});

module.exports = app;
