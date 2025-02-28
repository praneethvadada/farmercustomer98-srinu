const db = require("../config/db");

const createUser = (userData, callback) => {
    const sql = `INSERT INTO users (name, email, phone, password_hash, role, address_line1, address_line2, city, state, pin_code, profile_image) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, userData, callback);
};

const getUserByEmail = (email, callback) => {
    db.query("SELECT * FROM users WHERE email = ?", [email], callback);
};

module.exports = { createUser, getUserByEmail };
