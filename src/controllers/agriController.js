const db = require("../config/db");



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



// // ✅ **2. Get All Pending Requests (For Farmers)**
// exports.getRequests = (req, res) => {
//     console.log("🟢 getRequests API called!");

//     const sql = `SELECT * FROM agri_requests WHERE status = 'Pending' ORDER BY created_at DESC`;
//     db.query(sql, (err, results) => {
//         if (err) return res.status(500).json({ message: "Database error", error: err });
//         res.json({ requests: results });
//     });
// };



exports.getRequests = (req, res) => {
    console.log("🟢 getRequests API called!!!!!!!!!!!!!!!!!!!!!!!!!!!");

    const farmer_id = req.user.id; // Extract the authenticated farmer ID

    const sql = `
        SELECT 
            ar.*, 
            CASE 
                WHEN ar.id IN (SELECT request_id FROM agri_responses WHERE farmer_id = ?) 
                THEN true ELSE false 
            END AS has_responded 
        FROM agri_requests ar 
        WHERE ar.status = 'Pending' 
        ORDER BY ar.created_at DESC`;

    console.log("🟢 Executing SQL Query to Fetch Requests with Response Check");

    db.query(sql, [farmer_id], (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        console.log("✅ Requests fetched successfully");
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
        res.status(200).json({ message: "Response submitted successfully", response_id: result.insertId });
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


// // ✅ **5. Agree on a Request (Customer & Farmer)**
// exports.agreeOnRequest = (req, res) => {
//     console.log("🟢 agreeRequest API called!");
    
//     console.log("🟢 Received Request Body:", req.body);
//     console.log("🟢 Authenticated User ID:", req.user?.id);

//     const { agreed_quantity, agreed_price } = req.body;
//     const request_id = req.params.response_id;
//     const customer_id = req.user?.id;

//     console.log("🟢 Extracted request_id:", request_id);
//     console.log("🟢 Extracted customer_id:", customer_id);
//     console.log("🟢 Received agreed_quantity:", agreed_quantity);
//     console.log("🟢 Received agreed_price:", agreed_price);

//     if (!agreed_quantity || !agreed_price) {
//         console.error("❌ Missing agreed_quantity or agreed_price!");
//         return res.status(400).json({ message: "Missing required fields: agreed_quantity and agreed_price" });
//     }

//     const getFarmerQuery = `SELECT farmer_id FROM agri_responses WHERE id = ?`;
//     db.query(getFarmerQuery, [request_id], (err, result) => {
//         if (err) {
//             console.error("❌ Database Error:", err);
//             return res.status(500).json({ message: "Database error", error: err });
//         }
//         if (result.length === 0) {
//             console.error("❌ Response not found!");
//             return res.status(404).json({ message: "Response not found" });
//         }

//         const farmer_id = result[0].farmer_id;
//         console.log("🟢 Extracted farmer_id:", farmer_id);

//         const insertAgreementQuery = `
//             INSERT INTO agri_agreements (request_id, response_id, customer_id, farmer_id, agreed_quantity, agreed_price) 
//             VALUES (?, ?, ?, ?, ?, ?)`;

//         db.query(insertAgreementQuery, [request_id, request_id, customer_id, farmer_id, agreed_quantity, agreed_price], 
//             (err, result) => {
//                 if (err) {
//                     console.error("❌ Database Error:", err);
//                     return res.status(500).json({ message: "Database error", error: err });
//                 }
//                 console.log("✅ Agreement created successfully with ID:", result.insertId);
//                 res.status(201).json({ message: "Agreement created successfully", agreement_id: result.insertId });
//             });
//     });
// };

// exports.agreeOnRequest = (req, res) => {
//     console.log("🟢 agreeRequest API called!");
    
//     console.log("🟢 Received Request Body:", req.body);
//     console.log("🟢 Authenticated User ID:", req.user?.id);

//     const { agreed_quantity, agreed_price } = req.body;
//     const response_id = req.params.response_id; // This should be `response_id`
//     const customer_id = req.user?.id;

//     console.log("🟢 Extracted response_id:", response_id);
//     console.log("🟢 Extracted customer_id:", customer_id);
//     console.log("🟢 Received agreed_quantity:", agreed_quantity);
//     console.log("🟢 Received agreed_price:", agreed_price);

//     // 🔹 Validate Required Fields
//     if (!agreed_quantity || !agreed_price) {
//         console.error("❌ Missing agreed_quantity or agreed_price!");
//         return res.status(400).json({ message: "Missing required fields: agreed_quantity and agreed_price" });
//     }

//     // ✅ **Step 1: Validate that `response_id` exists in `agri_responses`**
//     const getResponseQuery = `SELECT request_id, farmer_id FROM agri_responses WHERE id = ?`;
//     db.query(getResponseQuery, [response_id], (err, result) => {
//         if (err) {
//             console.error("❌ Database Error in getResponseQuery:", err);
//             return res.status(500).json({ message: "Database error", error: err });
//         }
//         if (result.length === 0) {
//             console.error("❌ Response not found for response_id:", response_id);
//             return res.status(404).json({ message: "Response not found" });
//         }

//         const request_id = result[0].request_id;
//         const farmer_id = result[0].farmer_id;
//         console.log("🟢 Extracted request_id:", request_id);
//         console.log("🟢 Extracted farmer_id:", farmer_id);

//         // ✅ **Step 2: Validate that `request_id` exists in `agri_requests`**
//         const checkRequestQuery = `SELECT id FROM agri_requests WHERE id = ?`;
//         db.query(checkRequestQuery, [request_id], (err, reqCheckResult) => {
//             if (err) {
//                 console.error("❌ Database Error in checkRequestQuery:", err);
//                 return res.status(500).json({ message: "Database error", error: err });
//             }
//             if (reqCheckResult.length === 0) {
//                 console.error("❌ Request not found for request_id:", request_id);
//                 return res.status(404).json({ message: "Request not found" });
//             }

//             // ✅ **Step 3: Insert Agreement**
//             const insertAgreementQuery = `
//                 INSERT INTO agri_agreements (request_id, response_id, customer_id, farmer_id, agreed_quantity, agreed_price) 
//                 VALUES (?, ?, ?, ?, ?, ?)`;

//             db.query(insertAgreementQuery, [request_id, response_id, customer_id, farmer_id, agreed_quantity, agreed_price], 
//                 (err, result) => {
//                     if (err) {
//                         console.error("❌ Database Error in insertAgreementQuery:", err);
//                         return res.status(500).json({ message: "Database error", error: err });
//                     }
//                     console.log("✅ Agreement created successfully with ID:", result.insertId);
//                     res.status(201).json({ message: "Agreement created successfully", agreement_id: result.insertId });
//                 });
//         });
//     });
// };



// exports.agreeOnRequest = (req, res) => {
//     console.log("🟢 agreeRequest API called!");
    
//     console.log("🟢 Received Request Body:", req.body);
//     console.log("🟢 Authenticated User ID:", req.user?.id);

//     const { agreed_quantity, agreed_price } = req.body;
//     const response_id = req.params.response_id; // This should be `response_id`
//     const customer_id = req.user?.id;

//     console.log("🟢 Extracted response_id:", response_id);
//     console.log("🟢 Extracted customer_id:", customer_id);
//     console.log("🟢 Received agreed_quantity:", agreed_quantity);
//     console.log("🟢 Received agreed_price:", agreed_price);

//     // 🔹 Validate Required Fields
//     if (!agreed_quantity || !agreed_price) {
//         console.error("❌ Missing agreed_quantity or agreed_price!");
//         return res.status(400).json({ message: "Missing required fields: agreed_quantity and agreed_price" });
//     }

//     // ✅ **Step 1: Validate that `response_id` exists in `agri_responses`**
//     const getResponseQuery = `SELECT request_id, farmer_id FROM agri_responses WHERE id = ?`;
//     db.query(getResponseQuery, [response_id], (err, result) => {
//         if (err) {
//             console.error("❌ Database Error in getResponseQuery:", err);
//             return res.status(500).json({ message: "Database error", error: err });
//         }
//         if (result.length === 0) {
//             console.error("❌ Response not found for response_id:", response_id);
//             return res.status(404).json({ message: "Response not found" });
//         }

//         const request_id = result[0].request_id;
//         const farmer_id = result[0].farmer_id;
//         console.log("🟢 Extracted request_id:", request_id);
//         console.log("🟢 Extracted farmer_id:", farmer_id);

//         // ✅ **Step 2: Check if an agreement already exists for this request_id**
//         const checkExistingAgreementQuery = `SELECT id FROM agri_agreements WHERE request_id = ?`;
//         db.query(checkExistingAgreementQuery, [request_id], (err, existingResult) => {
//             if (err) {
//                 console.error("❌ Database Error in checkExistingAgreementQuery:", err);
//                 return res.status(500).json({ message: "Database error", error: err });
//             }

//             if (existingResult.length > 0) {
//                 console.warn("⚠️ Agreement already exists for request_id:", request_id);
//                 return res.status(400).json({ message: "Agreement already exists for this request." });
//             }

//             // ✅ **Step 3: Insert Agreement (Only if it doesn't exist)**
//             const insertAgreementQuery = `
//                 INSERT INTO agri_agreements (request_id, response_id, customer_id, farmer_id, agreed_quantity, agreed_price) 
//                 VALUES (?, ?, ?, ?, ?, ?)`;

//             db.query(insertAgreementQuery, [request_id, response_id, customer_id, farmer_id, agreed_quantity, agreed_price], 
//                 (err, result) => {
//                     if (err) {
//                         console.error("❌ Database Error in insertAgreementQuery:", err);
//                         return res.status(500).json({ message: "Database error", error: err });
//                     }
//                     console.log("✅ Agreement created successfully with ID:", result.insertId);
//                     res.status(201).json({ message: "Agreement created successfully", agreement_id: result.insertId });
//                 });
//         });
//     });
// };



exports.agreeOnRequest = (req, res) => {
    console.log("🟢 agreeRequest API called!");

    const { agreed_quantity, agreed_price } = req.body;
    const response_id = req.params.response_id;
    const customer_id = req.user?.id;

    if (!agreed_quantity || !agreed_price) {
        console.error("❌ Missing agreed_quantity or agreed_price!");
        return res.status(400).json({ message: "Missing required fields: agreed_quantity and agreed_price" });
    }

    const getResponseQuery = `SELECT request_id, farmer_id FROM agri_responses WHERE id = ?`;
    db.query(getResponseQuery, [response_id], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (result.length === 0) {
            console.error("❌ Response not found for response_id:", response_id);
            return res.status(404).json({ message: "Response not found" });
        }

        const request_id = result[0].request_id;
        const farmer_id = result[0].farmer_id;

        // ✅ **Check if agreement already exists**
        const checkExistingAgreementQuery = `SELECT id FROM agri_agreements WHERE request_id = ?`;
        db.query(checkExistingAgreementQuery, [request_id], (err, existingResult) => {
            if (err) {
                console.error("❌ Database Error in checkExistingAgreementQuery:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            if (existingResult.length > 0) {
                console.warn("⚠️ Agreement already exists for request_id:", request_id);
                return res.status(400).json({ message: "Agreement already exists for this request." });
            }

            // ✅ **Insert Agreement**
            const insertAgreementQuery = `
                INSERT INTO agri_agreements (request_id, response_id, customer_id, farmer_id, agreed_quantity, agreed_price) 
                VALUES (?, ?, ?, ?, ?, ?)`;

            db.query(insertAgreementQuery, [request_id, response_id, customer_id, farmer_id, agreed_quantity, agreed_price], 
                (err, result) => {
                    if (err) {
                        console.error("❌ Database Error in insertAgreementQuery:", err);
                        return res.status(500).json({ message: "Database error", error: err });
                    }
                    console.log("✅ Agreement created successfully with ID:", result.insertId);

                    // ✅ **Update `agri_requests` status to `Accepted`**
                    const updateRequestStatusQuery = `UPDATE agri_requests SET status = 'Accepted' WHERE id = ?`;
                    db.query(updateRequestStatusQuery, [request_id], (err) => {
                        if (err) {
                            console.error("❌ Database Error in updateRequestStatusQuery:", err);
                            return res.status(500).json({ message: "Failed to update request status", error: err });
                        }
                        console.log("✅ Request status updated to 'Accepted'");

                        res.status(201).json({ message: "Agreement created successfully", agreement_id: result.insertId });
                    });
                });
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


// exports.getCustomerAgreementHistory = (req, res) => {
//     console.log("🟢 getCustomerAgreementHistory API called!");
    
//     const customer_id = req.user.id;
//     console.log("🟢 Fetching history for customer_id:", customer_id);

//     const sql = `
//         SELECT aa.id AS agreement_id, ar.product_name, aa.agreed_quantity, aa.agreed_price, u.name AS farmer_name, u.phone AS farmer_contact, 
//                aa.created_at
//         FROM agri_agreements aa
//         JOIN agri_requests ar ON aa.request_id = ar.id
//         JOIN users u ON aa.farmer_id = u.id
//         WHERE aa.customer_id = ?
//         ORDER BY aa.created_at DESC
//     `;

//     db.query(sql, [customer_id], (err, results) => {
//         if (err) {
//             console.error("❌ Database Error:", err);
//             return res.status(500).json({ message: "Database error", error: err });
//         }
//         console.log("🟢 Agreements found:", results.length);
//         res.json({ agreements: results });
//     });
// };


// exports.getFarmerAgreementHistory = (req, res) => {
//     console.log("🟢 getFarmerAgreementHistory API called!");

//     const farmer_id = req.user.id;
//     console.log("🟢 Fetching history for farmer_id:", farmer_id);

//     const sql = `
//         SELECT aa.id AS agreement_id, ar.product_name, aa.agreed_quantity, aa.agreed_price, u.name AS customer_name, u.phone AS customer_contact, 
//                aa.created_at
//         FROM agri_agreements aa
//         JOIN agri_requests ar ON aa.request_id = ar.id
//         JOIN users u ON aa.customer_id = u.id
//         WHERE aa.farmer_id = ?
//         ORDER BY aa.created_at DESC
//     `;

//     db.query(sql, [farmer_id], (err, results) => {
//         if (err) {
//             console.error("❌ Database Error:", err);
//             return res.status(500).json({ message: "Database error", error: err });
//         }
//         console.log("🟢 Agreements found:", results.length);
//         res.json({ agreements: results });
//     });
// };





// exports.getCustomerAgreementHistory = (req, res) => {
//     console.log("🟢 getCustomerAgreementHistory API called!");

//     const customer_id = req.user.id;
//     console.log("🟢 Fetching history for customer_id:", customer_id);

//     const sql = `
//         SELECT aa.id AS agreement_id, ar.product_name, aa.agreed_quantity, aa.agreed_price, 
//                u.name AS farmer_name, u.phone AS farmer_contact, aa.agreement_status, 
//                aa.created_at
//         FROM agri_agreements aa
//         JOIN agri_requests ar ON aa.request_id = ar.id
//         JOIN users u ON aa.farmer_id = u.id
//         WHERE aa.customer_id = ? AND aa.agreement_status = 'Accepted'
//         ORDER BY aa.created_at DESC
//     `;

//     db.query(sql, [customer_id], (err, results) => {
//         if (err) {
//             console.error("❌ Database Error:", err);
//             return res.status(500).json({ message: "Database error", error: err });
//         }

//         console.log("🟢 Accepted Agreements found:", results.length);
//         res.json({ agreements: results });
//     });
// };
// exports.getFarmerAgreementHistory = (req, res) => {
//     console.log("🟢 getFarmerAgreementHistory API called!");

//     const farmer_id = req.user.id;
//     console.log("🟢 Fetching history for farmer_id:", farmer_id);

//     const sql = `
//         SELECT aa.id AS agreement_id, ar.product_name, aa.agreed_quantity, aa.agreed_price, 
//                u.name AS customer_name, u.phone AS customer_contact, aa.agreement_status, 
//                aa.created_at
//         FROM agri_agreements aa
//         JOIN agri_requests ar ON aa.request_id = ar.id
//         JOIN users u ON aa.customer_id = u.id
//         WHERE aa.farmer_id = ? AND aa.agreement_status = 'Accepted'
//         ORDER BY aa.created_at DESC
//     `;

//     db.query(sql, [farmer_id], (err, results) => {
//         if (err) {
//             console.error("❌ Database Error:", err);
//             return res.status(500).json({ message: "Database error", error: err });
//         }

//         console.log("🟢 Accepted Agreements found:", results.length);
//         res.json({ agreements: results });
//     });
// };


exports.getCustomerAgreementHistory = (req, res) => {
    console.log("🟢 getCustomerAgreementHistory API called!");

    const customer_id = req.user.id;
    console.log("🟢 Fetching history for customer_id:", customer_id);

    const sql = `
        SELECT aa.id AS agreement_id, ar.product_name, aa.agreed_quantity, aa.agreed_price, 
               u.name AS farmer_name, u.phone AS farmer_contact, aa.agreement_status, 
               aa.created_at
        FROM agri_agreements aa
        JOIN agri_requests ar ON aa.request_id = ar.id
        JOIN users u ON aa.farmer_id = u.id
        WHERE aa.customer_id = ?
        ORDER BY aa.created_at DESC
    `;

    db.query(sql, [customer_id], (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        console.log("🟢 Agreements found:", results.length);
        res.json({ agreements: results });
    });
};




exports.getFarmerAgreementHistory = (req, res) => {
    console.log("🟢 getFarmerAgreementHistory API called!");

    const farmer_id = req.user.id;
    console.log("🟢 Fetching history for farmer_id:", farmer_id);

    const sql = `
        SELECT aa.id AS agreement_id, ar.product_name, aa.agreed_quantity, aa.agreed_price, 
               u.name AS customer_name, u.phone AS customer_contact, aa.agreement_status, 
               aa.created_at
        FROM agri_agreements aa
        JOIN agri_requests ar ON aa.request_id = ar.id
        JOIN users u ON aa.customer_id = u.id
        WHERE aa.farmer_id = ?
        ORDER BY aa.created_at DESC
    `;

    db.query(sql, [farmer_id], (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        console.log("🟢 Agreements found:", results.length);
        res.json({ agreements: results });
    });
};









exports.getAgreementDetails = (req, res) => {
    console.log("🟢 getAgreementDetails API called!");
    
    const agreement_id = req.params.id;
    console.log("🟢 Fetching agreement details for agreement_id:", agreement_id);

    const sql = `
        SELECT aa.id AS agreement_id, ar.product_name, ar.description, aa.agreed_quantity, aa.agreed_price, 
               u1.name AS customer_name, u1.phone AS customer_contact, u2.name AS farmer_name, u2.phone AS farmer_contact, 
               aa.created_at
        FROM agri_agreements aa
        JOIN agri_requests ar ON aa.request_id = ar.id
        JOIN users u1 ON aa.customer_id = u1.id
        JOIN users u2 ON aa.farmer_id = u2.id
        WHERE aa.id = ?
    `;

    db.query(sql, [agreement_id], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Agreement not found" });
        }
        console.log("🟢 Agreement details fetched successfully!");
        res.json({ agreement: result[0] });
    });
};



exports.cancelAgreement = (req, res) => {
    console.log("🟢 cancelAgreement API called!");

    const agreement_id = req.params.id;
    const customer_id = req.user.id;

    console.log("🟢 Canceling agreement_id:", agreement_id, "for customer_id:", customer_id);

    const sql = `UPDATE agri_agreements SET status = 'Canceled' WHERE id = ? AND customer_id = ? AND status = 'Active'`;
    db.query(sql, [agreement_id, customer_id], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Agreement not found or cannot be canceled" });
        }
        console.log("✅ Agreement canceled successfully!");
        res.json({ message: "Agreement has been canceled" });
    });
};



