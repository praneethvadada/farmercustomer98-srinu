require("dotenv").config();
const jwt = require("jsonwebtoken");

// Ensure secret keys are properly loaded
const JWT_SECRET = process.env.JWT_SECRET?.trim();
const JWT_SECRET_FARMER = process.env.JWT_SECRET_FARMER?.trim();
const JWT_SECRET_CUSTOMER = process.env.JWT_SECRET_CUSTOMER?.trim();

console.log("🟢 Loaded JWT_SECRET:", JWT_SECRET);
console.log("🟢 Loaded JWT_SECRET_FARMER:", JWT_SECRET_FARMER);
console.log("🟢 Loaded JWT_SECRET_CUSTOMER:", JWT_SECRET_CUSTOMER);

const authMiddleware = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        console.error("❌ Token Missing: No token in request headers");
        return res.status(401).json({ message: "Access denied, token missing!" });
    }

    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        console.error("❌ Invalid Token Format:", token);
        return res.status(401).json({ message: "Invalid token format" });
    }

    const actualToken = tokenParts[1];

    console.log("🟢 Token Received:", actualToken);

    try {
        const decoded = jwt.verify(actualToken, JWT_SECRET);
        console.log("🟢 JWT Verified Successfully:", decoded);
        req.user = decoded;
        return next();
    } catch (error1) {
        console.error("❌ JWT Verification Failed with JWT_SECRET:", error1.message);

        // Try verifying with farmer secret
        try {
            const decodedFarmer = jwt.verify(actualToken, JWT_SECRET_FARMER);
            console.log("🟢 JWT Verified Successfully (Farmer):", decodedFarmer);
            req.user = decodedFarmer;
            return next();
        } catch (error2) {
            console.error("❌ JWT Verification Failed with JWT_SECRET_FARMER:", error2.message);
        }

        // Try verifying with customer secret
        try {
            const decodedCustomer = jwt.verify(actualToken, JWT_SECRET_CUSTOMER);
            console.log("🟢 JWT Verified Successfully (Customer):", decodedCustomer);
            req.user = decodedCustomer;
            return next();
        } catch (error3) {
            console.error("❌ JWT Verification Failed with JWT_SECRET_CUSTOMER:", error3.message);
        }

        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;



// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');

// dotenv.config();

// const authMiddleware = (req, res, next) => {
//     const token = req.headers['authorization'];

//     if (!token) return res.status(401).json({ message: 'Access denied, token missing!' });

//     const tokenParts = token.split(' ');
//     if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
//         return res.status(401).json({ message: 'Invalid token format' });
//     }

//     const actualToken = tokenParts[1];

//     try {
//         const decodedFarmer = jwt.verify(actualToken, process.env.JWT_SECRET_FARMER);
//         req.user = decodedFarmer;
//         return next();
//     } catch (error1) {
//         try {
//             const decodedCustomer = jwt.verify(actualToken, process.env.JWT_SECRET_CUSTOMER);
//             req.user = decodedCustomer;
//             return next();
//         } catch (error2) {
//             return res.status(401).json({ message: 'Invalid or expired token' });
//         }
//     }
// }; 

// // ✅ Correct Export
// module.exports = authMiddleware;

// // const jwt = require('jsonwebtoken');
// // const dotenv = require('dotenv');

// // dotenv.config();

// // // ✅ Define the function before exporting
// // const authMiddleware = (req, res, next) => {
// //     const token = req.headers['authorization'];

// //     if (!token) return res.status(401).json({ message: 'Access denied, token missing!' });

// //     const tokenParts = token.split(' ');
// //     if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
// //         return res.status(401).json({ message: 'Invalid token format' });
// //     }

// //     const actualToken = tokenParts[1];

// //     try {
// //         // Try verifying with Farmer secret
// //         const decodedFarmer = jwt.verify(actualToken, process.env.JWT_SECRET_FARMER);
// //         req.user = decodedFarmer;
// //         return next();
// //     } catch (error1) {
// //         try {
// //             // Try verifying with Customer secret
// //             const decodedCustomer = jwt.verify(actualToken, process.env.JWT_SECRET_CUSTOMER);
// //             req.user = decodedCustomer;
// //             return next();
// //         } catch (error2) {
// //             return res.status(401).json({ message: 'Invalid or expired token' });
// //         }
// //     }
// // };

// // // ✅ Correct export statement
// // module.exports = { authMiddleware };


// // // const jwt = require("jsonwebtoken");
// // // require("dotenv").config();

// // // module.exports = (req, res, next) => {
// // //     const token = req.header("Authorization");
// // //     if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

// // //     try {
// // //         const tokenValue = token.split(" ")[1];
// // //         const decoded = jwt.decode(tokenValue);

// // //         if (!decoded || !decoded.role || !decoded.id) {
// // //             return res.status(400).json({ message: "Invalid token format." });
// // //         }

// // //         const secretKey = decoded.role === "farmer" ? process.env.JWT_SECRET_FARMER : process.env.JWT_SECRET_CUSTOMER;
// // //         const verified = jwt.verify(tokenValue, secretKey);
// // //         req.user = verified;
// // //         next();
// // //     } catch (err) {
// // //         res.status(403).json({ message: "Invalid or expired token." });
// // //     }
// // // };

// // // // const jwt = require("jsonwebtoken");
// // // // require("dotenv").config();


// // // // module.exports = (req, res, next) => {
// // // //     console.log("✅ JWT Middleware Triggered");

// // // //     const token = req.header("Authorization");
// // // //     if (!token) {
// // // //         console.warn("🚨 No Token Provided");
// // // //         return res.status(401).json({ message: "Access denied. No token provided." });
// // // //     }

// // // //     try {
// // // //         const tokenValue = token.split(" ")[1];
// // // //         console.log("🔍 Token Received:", tokenValue);

// // // //         const decoded = jwt.decode(tokenValue);
// // // //         console.log("🔍 Decoded Token Payload:", decoded);

// // // //         if (!decoded || !decoded.role || !decoded.id) {
// // // //             console.warn("🚨 Invalid Token Format");
// // // //             return res.status(400).json({ message: "Invalid token format." });
// // // //         }

// // // //         const secretKey = decoded.role === "farmer" ? process.env.JWT_SECRET_FARMER : process.env.JWT_SECRET_CUSTOMER;
// // // //         const verified = jwt.verify(tokenValue, secretKey);
// // // //         req.user = verified;

// // // //         console.log("✅ Verified User:", req.user);
// // // //         next();
// // // //     } catch (err) {
// // // //         console.error("🚨 JWT Verification Error:", err.message);
// // // //         res.status(403).json({ message: "Invalid or expired token." });
// // // //     }
// // // // };


// // // // // module.exports = (req, res, next) => {
// // // // //     const token = req.header("Authorization");
// // // // //     if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

// // // // //     try {
// // // // //         const tokenValue = token.split(" ")[1]; // Extract token after "Bearer"
// // // // //         const decoded = jwt.decode(tokenValue); // Decode first to log payload
// // // // //         console.log("Decoded Token Payload:", decoded); // 🔍 Log token payload for debugging

// // // // //         if (!decoded || !decoded.role || !decoded.id) {
// // // // //             return res.status(400).json({ message: "Invalid token format." });
// // // // //         }

// // // // //         // Choose the correct secret key based on role
// // // // //         const secretKey = decoded.role === "farmer" ? process.env.JWT_SECRET_FARMER : process.env.JWT_SECRET_CUSTOMER;
// // // // //         const verified = jwt.verify(tokenValue, secretKey);
// // // // //         req.user = verified; // Attach user info to request

// // // // //         console.log("Verified User from Token:", req.user); // 🔍 Log verified user data
// // // // //         next();
// // // // //     } catch (err) {
// // // // //         console.error("JWT Verification Error:", err.message);
// // // // //         res.status(403).json({ message: "Invalid or expired token." });
// // // // //     }
// // // // // };


// // // // // const jwt = require("jsonwebtoken");
// // // // // require("dotenv").config();

// // // // // module.exports = (req, res, next) => {
// // // // //     const token = req.header("Authorization");
// // // // //     if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

// // // // //     try {
// // // // //         const tokenValue = token.split(" ")[1]; // Extract token
// // // // //         const decoded = jwt.decode(tokenValue); // Decode without verifying to get role & ID
// // // // //         console.log("Decoded Token:", decoded); // 🔍 Debugging: Log token payload

// // // // //         if (!decoded || !decoded.role || !decoded.id) {
// // // // //             return res.status(400).json({ message: "Invalid token format." });
// // // // //         }

// // // // //         // Select the correct secret key
// // // // //         const secretKey = decoded.role === "farmer" ? process.env.JWT_SECRET_FARMER : process.env.JWT_SECRET_CUSTOMER;
// // // // //         const verified = jwt.verify(tokenValue, secretKey);
// // // // //         req.user = verified; // Attach user info to request
// // // // //         next();
// // // // //     } catch (err) {
// // // // //         console.error("JWT Verification Error:", err.message);
// // // // //         res.status(403).json({ message: "Invalid or expired token." });
// // // // //     }
// // // // // };

// // // // // // const jwt = require("jsonwebtoken");
// // // // // // require("dotenv").config();

// // // // // // module.exports = (req, res, next) => {
// // // // // //     const token = req.header("Authorization");
// // // // // //     if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

// // // // // //     try {
// // // // // //         const tokenValue = token.split(" ")[1]; // Remove "Bearer " prefix if present
// // // // // //         const decoded = jwt.decode(tokenValue); // Decode without verifying to get the role
// // // // // //         if (!decoded || !decoded.role) return res.status(400).json({ message: "Invalid token format." });

// // // // // //         // Choose the correct secret key based on user role
// // // // // //         const secretKey = decoded.role === "farmer" ? process.env.JWT_SECRET_FARMER : process.env.JWT_SECRET_CUSTOMER;

// // // // // //         // Verify the token using the correct secret
// // // // // //         const verified = jwt.verify(tokenValue, secretKey);
// // // // // //         req.user = verified; // Attach user info to request
// // // // // //         next();
// // // // // //     } catch (err) {
// // // // // //         console.error("JWT Verification Error:", err.message);
// // // // // //         res.status(403).json({ message: "Invalid or expired token." });
// // // // // //     }
// // // // // // };

// // // // // // // const jwt = require("jsonwebtoken");
// // // // // // // require("dotenv").config();

// // // // // // // module.exports = (req, res, next) => {
// // // // // // //     const token = req.header("Authorization");
// // // // // // //     if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

// // // // // // //     try {
// // // // // // //         const decoded = jwt.decode(token);
// // // // // // //         if (!decoded || !decoded.role) return res.status(400).json({ message: "Invalid token." });

// // // // // // //         // Determine the correct secret key based on the role
// // // // // // //         const secretKey = decoded.role === "farmer" ? process.env.JWT_SECRET_FARMER : process.env.JWT_SECRET_CUSTOMER;
// // // // // // //         const verified = jwt.verify(token, secretKey);

// // // // // // //         req.user = verified; // Attach user details to request

// // // // // // //         next();
// // // // // // //     } catch (err) {
// // // // // // //         res.status(403).json({ message: "Invalid or expired token." });
// // // // // // //     }
// // // // // // // };



// // // // // // // // const jwt = require("jsonwebtoken");
// // // // // // // // require("dotenv").config();

// // // // // // // // module.exports = (req, res, next) => {
// // // // // // // //     const token = req.header("Authorization");
// // // // // // // //     if (!token) return res.status(401).json({ message: "Access denied" });

// // // // // // // //     try {
// // // // // // // //         // Decode JWT to get role
// // // // // // // //         const decoded = jwt.decode(token);
// // // // // // // //         if (!decoded || !decoded.role) return res.status(400).json({ message: "Invalid token" });

// // // // // // // //         // Select correct secret key
// // // // // // // //         const secretKey = decoded.role === "farmer" ? process.env.JWT_SECRET_FARMER : process.env.JWT_SECRET_CUSTOMER;

// // // // // // // //         // Verify token with respective secret key
// // // // // // // //         const verified = jwt.verify(token, secretKey);
// // // // // // // //         req.user = verified;
// // // // // // // //         next();
// // // // // // // //     } catch (err) {
// // // // // // // //         res.status(400).json({ message: "Invalid token" });
// // // // // // // //     }
// // // // // // // // };

// // // // // // // // // const jwt = require("jsonwebtoken");
// // // // // // // // // require("dotenv").config();

// // // // // // // // // module.exports = (req, res, next) => {
// // // // // // // // //     const token = req.header("Authorization");
// // // // // // // // //     if (!token) return res.status(401).json({ message: "Access denied" });

// // // // // // // // //     try {
// // // // // // // // //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
// // // // // // // // //         req.user = decoded;
// // // // // // // // //         next();
// // // // // // // // //     } catch (err) {
// // // // // // // // //         res.status(400).json({ message: "Invalid token" });
// // // // // // // // //     }
// // // // // // // // // };
