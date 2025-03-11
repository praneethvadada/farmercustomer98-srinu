const db = require("../config/db");
const bcrypt = require("bcrypt");

// ✅ **1. Get Profile Details**
exports.getProfile = (req, res) => {
    console.log("🟢 getProfile API called!");
    const user_id = req.user.id;

    const sql = `SELECT id, name, email, phone, role, address_line1, address_line2, city, state, pin_code 
                 FROM users WHERE id = ?`;

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (result.length === 0) {
            console.warn("⚠️ User not found!");
            return res.status(404).json({ message: "User not found" });
        }

        console.log("🟢 Profile fetched successfully!");
        res.json(result[0]);
    });
};

// ✅ **2. Update Profile Details**
exports.updateProfile = (req, res) => {
    console.log("🟢 updateProfile API called!");
    const user_id = req.user.id;
    const { name, phone, address_line1, address_line2, city, state, pin_code } = req.body;

    const sql = `UPDATE users SET name = ?, phone = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, pin_code = ? 
                 WHERE id = ?`;

    db.query(sql, [name, phone, address_line1, address_line2, city, state, pin_code, user_id], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        console.log("🟢 Profile updated successfully!");
        res.json({ message: "Profile updated successfully" });
    });
};

// ✅ **3. Change Password**
exports.changePassword = (req, res) => {
    console.log("🟢 changePassword API called!");
    const user_id = req.user.id;
    const { old_password, new_password } = req.body;

    // Step 1: Get User's Current Password
    const getUserPasswordQuery = `SELECT password_hash FROM users WHERE id = ?`;
    
    db.query(getUserPasswordQuery, [user_id], async (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (result.length === 0) {
            console.warn("⚠️ User not found!");
            return res.status(404).json({ message: "User not found" });
        }

        const storedPassword = result[0].password_hash;

        // Step 2: Verify Old Password
        const isMatch = await bcrypt.compare(old_password, storedPassword);
        if (!isMatch) {
            console.warn("⚠️ Incorrect Old Password!");
            return res.status(400).json({ message: "Incorrect old password" });
        }

        // Step 3: Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        // Step 4: Update Password in Database
        const updatePasswordQuery = `UPDATE users SET password_hash = ? WHERE id = ?`;
        
        db.query(updatePasswordQuery, [hashedPassword, user_id], (err) => {
            if (err) {
                console.error("❌ Database Error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            console.log("🟢 Password updated successfully!");
            res.json({ message: "Password updated successfully" });
        });
    });
};
