const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, getUserByEmail } = require("../models/userModel");



exports.register = async (req, res) => {
    try {
        console.log("Incoming request body:", req.body);
        console.log("Incoming file:", req.file);

        const { name, email, phone, password, role, address_line1, address_line2, city, state, pin_code } = req.body;
        const profile_image = req.file ? req.file.filename : null;

        if (!name || !email || !password || !role) {
            console.log("Missing required fields");
            return res.status(400).json({ message: "Missing required fields" });
        }

        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Password hashed successfully");

        console.log("Creating user with details:", {
            name, email, phone, hashedPassword, role, address_line1, address_line2, city, state, pin_code, profile_image
        });

        createUser([
            name, email, phone, hashedPassword, role, address_line1, address_line2, city, state, pin_code, profile_image
        ], (err, result) => {
            if (err) {
                console.log("Database error:", err.message);
                return res.status(500).json({ message: err.message });
            }
            console.log("User registered successfully");
            res.status(200).json({ message: "User registered successfully" });
        });

    } catch (error) {
        console.log("Unexpected error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// exports.login = (req, res) => {
//     const { email, password } = req.body;
//     if (!email || !password) return res.status(400).json({ message: "Missing fields" });

//     getUserByEmail(email, async (err, results) => {
//         if (err || results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

//         const user = results[0];
//         const isMatch = await bcrypt.compare(password, user.password_hash);
//         if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//         const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
//         res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
//     });
// };



exports.login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    getUserByEmail(email, async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // Choose secret key based on role
        const secretKey = user.role === "farmer" ? process.env.JWT_SECRET_FARMER : process.env.JWT_SECRET_CUSTOMER;

        // Generate JWT Token
        const token = jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn: "1d" });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
};