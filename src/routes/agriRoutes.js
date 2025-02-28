const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const agriController = require("../controllers/agriController");

// ✅ Customer creates a new request
router.post("/request", authMiddleware, agriController.createRequest);

// ✅ Farmers fetch pending requests
router.get("/requests", authMiddleware, agriController.getRequests);

// ✅ Farmers respond to a request
router.post("/respond/:request_id", authMiddleware, agriController.respondToRequest);

// ✅ Get responses for a specific request (for customers)
router.get("/responses/:request_id", authMiddleware, agriController.getResponsesForRequest);

// ✅ Customer and farmer confirm an agreement
router.post("/agree/:response_id", authMiddleware, agriController.agreeOnRequest);

// ✅ Get agreement history
router.get("/history", authMiddleware, agriController.getHistory);

module.exports = router;