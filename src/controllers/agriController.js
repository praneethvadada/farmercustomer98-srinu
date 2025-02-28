const db = require("../config/db");

// ✅ **1. Create Request (Customer)**
// exports.createRequest = (req, res) => {
//     console.log("🟢 createRequest API called!");
//     console.log("🟢 Received Request Body:", req.body);
//     console.log("🟢 Authenticated User ID:", req.user?.id); // Check if user is correctly extracted
//     const { product_name, quantity, unit, description } = req.body;
//     const customer_id = req.user.id;

//     if (!product_name || !quantity || !unit) {
//         return res.status(400).json({ message: "Missing required fields." });
//     }

//     const sql = `INSERT INTO agri_requests (customer_id, product_name, quantity, unit, description) VALUES (?, ?, ?, ?, ?)`;
//     db.query(sql, [customer_id, product_name, quantity, unit, description], (err, result) => {
//         if (err) return res.status(500).json({ message: "Database error", error: err });
//         res.status(201).json({ message: "Request created successfully", request_id: result.insertId });
//     });
// };



// ✅ **1. Create Agri Request (Customer)**
exports.createRequest = (req, res) => {
    console.log("🟢 createRequest API called!");

    // 🔹 Log the received data
    console.log("🟢 Received Request Body:", req.body);
    console.log("🟢 Authenticated User ID:", req.user?.id);

    const { product_name, quantity, unit, description } = req.body;
    const customer_id = req.user?.id;

    // 🔹 Debugging: Check missing fields
    if (!customer_id) console.error("❌ Customer ID is missing!");
    if (!product_name) console.error("❌ Product Name is missing!");
    if (!quantity) console.error("❌ Quantity is missing!");
    if (!unit) console.error("❌ Unit is missing!");

    // 🔹 Validation Check
    if (!product_name || !quantity || !unit) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    // ✅ Insert request into database
    const sql = `INSERT INTO agri_requests (customer_id, product_name, quantity, unit, description) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [customer_id, product_name, quantity, unit, description], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        console.log("✅ Request created successfully with ID:", result.insertId);
        res.status(201).json({ message: "Request created successfully", request_id: result.insertId });
    });
};


// ✅ **2. Get All Pending Requests (For Farmers)**
exports.getRequests = (req, res) => {
    console.log("🟢 getRequests API called!");

    const sql = `SELECT * FROM agri_requests WHERE status = 'Pending' ORDER BY created_at DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json({ requests: results });
    });
};

// ✅ **3. Respond to a Request (Farmer)**
exports.respondToRequest = (req, res) => {
    console.log("🟢 respondToRequest API called!");
    const { request_id } = req.params;
    const { available_quantity, price_per_unit, message } = req.body;
    const farmer_id = req.user.id;

    const sql = `INSERT INTO agri_responses (request_id, farmer_id, available_quantity, price_per_unit, message) 
                 VALUES (?, ?, ?, ?, ?)`;

    db.query(sql, [request_id, farmer_id, available_quantity, price_per_unit, message], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.status(201).json({ message: "Response submitted successfully", response_id: result.insertId });
    });
};

// ✅ **4. Get Responses for a Request (Customer)**
exports.getResponsesForRequest = (req, res) => {
    console.log("🟢 getResponsesForRequest API called!");
    const { request_id } = req.params;

    const sql = `SELECT * FROM agri_responses WHERE request_id = ?`;
    db.query(sql, [request_id], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json({ responses: results });
    });
};

// ✅ **5. Agree on a Request (Customer & Farmer)**
// exports.agreeOnRequest = (req, res) => {
//     console.log("🟢 agreeOnRequest API called!");
//     const { response_id } = req.params;
//     const { agreed_quantity, agreed_price } = req.body;
//     const customer_id = req.user.id;

//     const checkSql = `SELECT * FROM agri_responses WHERE id = ?`;
//     db.query(checkSql, [response_id], (err, results) => {
//         if (err) return res.status(500).json({ message: "Database error", error: err });

//         if (results.length === 0) return res.status(404).json({ message: "Response not found" });

//         const { request_id, farmer_id } = results[0];

//         const sql = `INSERT INTO agri_agreements (request_id, response_id, customer_id, farmer_id, agreed_quantity, agreed_price) 
//                      VALUES (?, ?, ?, ?, ?, ?)`;

//         db.query(sql, [request_id, response_id, customer_id, farmer_id, agreed_quantity, agreed_price], (err, result) => {
//             if (err) return res.status(500).json({ message: "Database error", error: err });
//             res.status(201).json({ message: "Agreement made successfully", agreement_id: result.insertId });
//         });
//     });
// };



exports.agreeOnRequest = (req, res) => {
    console.log("🟢 agreeRequest API called!");
    
    console.log("🟢 Received Request Body:", req.body);
    console.log("🟢 Authenticated User ID:", req.user?.id);

    const { agreed_quantity, agreed_price } = req.body;
    const request_id = req.params.response_id;
    const customer_id = req.user?.id;

    console.log("🟢 Extracted request_id:", request_id);
    console.log("🟢 Extracted customer_id:", customer_id);
    console.log("🟢 Received agreed_quantity:", agreed_quantity);
    console.log("🟢 Received agreed_price:", agreed_price);

    if (!agreed_quantity || !agreed_price) {
        console.error("❌ Missing agreed_quantity or agreed_price!");
        return res.status(400).json({ message: "Missing required fields: agreed_quantity and agreed_price" });
    }

    const getFarmerQuery = `SELECT farmer_id FROM agri_responses WHERE id = ?`;
    db.query(getFarmerQuery, [request_id], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (result.length === 0) {
            console.error("❌ Response not found!");
            return res.status(404).json({ message: "Response not found" });
        }

        const farmer_id = result[0].farmer_id;
        console.log("🟢 Extracted farmer_id:", farmer_id);

        const insertAgreementQuery = `
            INSERT INTO agri_agreements (request_id, response_id, customer_id, farmer_id, agreed_quantity, agreed_price) 
            VALUES (?, ?, ?, ?, ?, ?)`;

        db.query(insertAgreementQuery, [request_id, request_id, customer_id, farmer_id, agreed_quantity, agreed_price], 
            (err, result) => {
                if (err) {
                    console.error("❌ Database Error:", err);
                    return res.status(500).json({ message: "Database error", error: err });
                }
                console.log("✅ Agreement created successfully with ID:", result.insertId);
                res.status(201).json({ message: "Agreement created successfully", agreement_id: result.insertId });
            });
    });
};


// ✅ **6. Get Agreement History**
exports.getHistory = (req, res) => {
    console.log("🟢 getHistory API called!");
    const sql = `SELECT * FROM agri_history ORDER BY timestamp DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json({ history: results });
    });
};


