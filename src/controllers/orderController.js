const db = require("../config/db");

// Helper: Get user address
const getUserAddress = (user_id, callback) => {
    const sql = `
        SELECT CONCAT(address_line1, ', ', address_line2, ', ', city, ', ', state, ', ', pin_code) AS full_address 
        FROM users WHERE id = ?`;
    db.query(sql, [user_id], (err, results) => {
        if (err) return callback(err, null);
        if (results.length === 0) return callback(new Error("User not found"), null);
        callback(null, results[0].full_address);
    });
};

// ✅ **Place Order Directly from Cart**
exports.placeOrder = (req, res) => {
    console.log("🟢 placeOrder called");

    const customer_id = req.user.id;

    // 🔹 Step 1: Get cart items and calculate total
    const cartQuery = `
        SELECT c.product_id, c.quantity, p.price, p.farmer_id 
        FROM cart c 
        JOIN products p ON c.product_id = p.id 
        WHERE c.customer_id = ?`;
    
    db.query(cartQuery, [customer_id], (err, cartItems) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

        let total_price = 0;
        let farmer_id = cartItems[0].farmer_id;  // Assuming single farmer per order

        cartItems.forEach(item => {
            total_price += item.price * item.quantity;
        });

        // 🔹 Step 2: Fetch Addresses
        getUserAddress(customer_id, (err, customer_address) => {
            if (err) return res.status(500).json({ message: "Failed to fetch customer address", error: err });

            getUserAddress(farmer_id, (err, farmer_address) => {
                if (err) return res.status(500).json({ message: "Failed to fetch farmer address", error: err });

                // 🔹 Step 3: Insert Order
                const orderQuery = `INSERT INTO orders (customer_id, farmer_id, total_price, customer_address, farmer_address) 
                                    VALUES (?, ?, ?, ?, ?)`;
                
                db.query(orderQuery, [customer_id, farmer_id, total_price, customer_address, farmer_address], 
                    (err, orderResult) => {
                        if (err) return res.status(500).json({ message: "Database error", error: err });

                        const order_id = orderResult.insertId;

                        // 🔹 Step 4: Insert Order Items
                        const orderItemsQuery = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?`;

                        const orderItemsData = cartItems.map(item => [order_id, item.product_id, item.quantity, item.price]);

                        db.query(orderItemsQuery, [orderItemsData], (err) => {
                            if (err) return res.status(500).json({ message: "Failed to insert order items", error: err });

                            // 🔹 Step 5: Clear Customer's Cart
                            db.query("DELETE FROM cart WHERE customer_id = ?", [customer_id], (err) => {
                                if (err) return res.status(500).json({ message: "Failed to clear cart", error: err });

                                res.status(201).json({ message: "Order placed successfully", order_id });
                            });
                        });
                    });
            });
        });
    });
};

// ✅ **Get Customer Order History**
exports.getCustomerOrders = (req, res) => {
    console.log("🟢 getCustomerOrders called");
    const customer_id = req.user.id;

    const sql = `SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC`;
    db.query(sql, [customer_id], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.json({ orders: results });
    });
};




exports.getFarmerOrders = (req, res) => {
    console.log("🟢 getFarmerOrders API called!");

    // 1️⃣ Extract farmer_id from the authenticated user
    const farmer_id = req.user?.id;
    console.log("🟢 Extracted Farmer ID:", farmer_id);

    if (!farmer_id) {
        console.error("❌ Error: Farmer ID is missing from JWT");
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // 2️⃣ SQL Query to fetch farmer's orders
    const sql = `
        SELECT 
            oi.id AS order_item_id, 
            oi.order_id, 
            oi.product_id, 
            oi.quantity, 
            oi.price, 
            o.customer_id, 
            o.customer_address, 
            o.order_status, 
            o.created_at
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE p.farmer_id = ?
        ORDER BY o.created_at DESC`;

    console.log("🟢 Executing SQL Query:", sql);
    console.log("🟢 With Farmer ID:", farmer_id);

    db.query(sql, [farmer_id], (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        console.log("🟢 SQL Query Executed Successfully!");
        console.log("🟢 Total Orders Found:", results.length);

        if (results.length === 0) {
            console.warn("⚠️ No orders found for this farmer");
            return res.status(404).json({ message: "No orders found for this farmer" });
        }

        console.log("🟢 Sending Response:", JSON.stringify({ orders: results }, null, 2));
        res.json({ orders: results });
    });
};




// ✅ **Confirm Order (Farmer)**
exports.confirmOrder = (req, res) => {
    console.log("🟢 confirmOrder called");
    const { id } = req.params;
    const farmer_id = req.user.id;

    const sql = `UPDATE orders SET order_status = 'Confirmed' WHERE id = ? AND farmer_id = ?`;
    db.query(sql, [id, farmer_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Order not found" });

        res.json({ message: "Order confirmed successfully" });
    });
};






// ✅ Update Order Status (Farmer only)
// exports.updateOrderStatus = (req, res) => {
//     console.log("🟢 updateOrderStatus API called!");

//     const { order_id } = req.params;
//     const { new_status } = req.body;
//     const farmer_id = req.user?.id; // Extract from JWT

//     console.log("🟢 Extracted Order ID:", order_id);
//     console.log("🟢 Extracted Farmer ID:", farmer_id);
//     console.log("🟢 New Status:", new_status);

//     if (!farmer_id) {
//         console.error("❌ Unauthorized: Farmer ID Missing");
//         return res.status(401).json({ message: "Unauthorized: Invalid token" });
//     }

//     // ✅ Check if the order exists and is owned by the farmer
//     const checkSql = `
//         SELECT o.id FROM orders o
//         JOIN order_items oi ON o.id = oi.order_id
//         JOIN products p ON oi.product_id = p.id
//         WHERE o.id = ? AND p.farmer_id = ?
//     `;

//     db.query(checkSql, [order_id, farmer_id], (err, result) => {
//         if (err) {
//             console.error("❌ Database Error:", err);
//             return res.status(500).json({ message: "Database error", error: err });
//         }

//         if (result.length === 0) {
//             console.warn("⚠️ Order not found or does not belong to this farmer");
//             return res.status(404).json({ message: "Order not found" });
//         }

//         // ✅ Update order status
//         const updateSql = `UPDATE orders SET order_status = ? WHERE id = ?`;
//         db.query(updateSql, [new_status, order_id], (err, updateResult) => {
//             if (err) {
//                 console.error("❌ Error Updating Order Status:", err);
//                 return res.status(500).json({ message: "Failed to update order status", error: err });
//             }

//             console.log("✅ Order Status Updated Successfully!");
//             res.json({ message: "Order status updated successfully." });
//         });
//     });
// };


// exports.updateOrderStatus = (req, res) => {
//     console.log("🟢 updateOrderStatus API called!");

//     const { id } = req.params; // ✅ Change order_id to id
//     const { new_status } = req.body;
//     const farmer_id = req.user?.id; // Extract from JWT

//     console.log("🟢 Extracted Order ID:", id);
//     console.log("🟢 Extracted Farmer ID:", farmer_id);
//     console.log("🟢 New Status:", new_status);

//     if (!farmer_id) {
//         console.error("❌ Unauthorized: Farmer ID Missing");
//         return res.status(401).json({ message: "Unauthorized: Invalid token" });
//     }

//     // ✅ Check if the order exists and is owned by the farmer
//     const checkSql = `
//         SELECT o.id FROM orders o
//         JOIN order_items oi ON o.id = oi.order_id
//         JOIN products p ON oi.product_id = p.id
//         WHERE o.id = ? AND p.farmer_id = ?
//     `;

//     db.query(checkSql, [id, farmer_id], (err, result) => {
//         if (err) {
//             console.error("❌ Database Error:", err);
//             return res.status(500).json({ message: "Database error", error: err });
//         }

//         if (result.length === 0) {
//             console.warn("⚠️ Order not found or does not belong to this farmer");
//             return res.status(404).json({ message: "Order not found" });
//         }

//         // ✅ Update order status
//         const updateSql = `UPDATE orders SET order_status = ? WHERE id = ?`;
//         db.query(updateSql, [new_status, id], (err, updateResult) => {
//             if (err) {
//                 console.error("❌ Error Updating Order Status:", err);
//                 return res.status(500).json({ message: "Failed to update order status", error: err });
//             }

//             console.log("✅ Order Status Updated Successfully!");
//             res.json({ message: "Order status updated successfully." });
//         });
//     });
// };



exports.updateOrderStatus = (req, res) => {
    console.log("🟢 updateOrderStatus API called!");

    const { id } = req.params; // ✅ Extract order ID
    const { new_status } = req.body; // ✅ Extract the correct status key
    const farmer_id = req.user?.id; // ✅ Extract from JWT

    console.log("🟢 Extracted Order ID:", id);
    console.log("🟢 Extracted Farmer ID:", farmer_id);
    console.log("🟢 Received New Status:", new_status);

    if (!farmer_id) {
        console.error("❌ Unauthorized: Farmer ID Missing");
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    if (!new_status) {
        console.error("❌ Invalid request: new_status is missing");
        return res.status(400).json({ message: "Invalid request: new_status is required" });
    }

    // ✅ Check if the order exists and is owned by the farmer
    const checkSql = `
        SELECT o.id FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.id = ? AND p.farmer_id = ?
    `;

    db.query(checkSql, [id, farmer_id], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (result.length === 0) {
            console.warn("⚠️ Order not found or does not belong to this farmer");
            return res.status(404).json({ message: "Order not found" });
        }

        // ✅ Update order status
        const updateSql = `UPDATE orders SET order_status = ? WHERE id = ?`;
        db.query(updateSql, [new_status, id], (err, updateResult) => {
            if (err) {
                console.error("❌ Error Updating Order Status:", err);
                return res.status(500).json({ message: "Failed to update order status", error: err });
            }

            console.log("✅ Order Status Updated Successfully!");
            res.json({ message: "Order status updated successfully." });
        });
    });
};

// ✅ **Cancel Order (Customer)**
exports.cancelOrder = (req, res) => {
    console.log("🟢 cancelOrder called");
    const { id } = req.params;
    const customer_id = req.user.id;

    const sql = `UPDATE orders SET order_status = 'Canceled' WHERE id = ? AND customer_id = ?`;
    db.query(sql, [id, customer_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Order not found" });

        res.json({ message: "Order has been canceled" });
    });
};

// const db = require("../config/db");

// // Helper function to get address
// const getUserAddress = (user_id, callback) => {
//     const sql = `
//         SELECT CONCAT(address_line1, ', ', address_line2, ', ', city, ', ', state, ', ', pin_code) AS full_address 
//         FROM users WHERE id = ?`;
//     db.query(sql, [user_id], (err, results) => {
//         if (err) return callback(err, null);
//         if (results.length === 0) return callback(new Error("User not found"), null);
//         callback(null, results[0].full_address);
//     });
// };

// // ✅ Place Order (Customer)
// exports.placeOrder = (req, res) => {
//     console.log("🟢 placeOrder called");

//     const customer_id = req.user.id;
//     const { product_id, quantity, total_price } = req.body;

//     if (!product_id || !quantity || !total_price) {
//         return res.status(400).json({ message: "Missing required fields" });
//     }

//     // Get product details to fetch farmer_id
//     const productSql = "SELECT farmer_id FROM products WHERE id = ?";
//     db.query(productSql, [product_id], (err, productResults) => {
//         if (err) return res.status(500).json({ message: "Database error", error: err });
//         if (productResults.length === 0) return res.status(404).json({ message: "Product not found" });

//         const farmer_id = productResults[0].farmer_id;

//         // Fetch addresses for customer and farmer
//         getUserAddress(customer_id, (err, customer_address) => {
//             if (err) return res.status(500).json({ message: "Failed to fetch customer address", error: err });

//             getUserAddress(farmer_id, (err, farmer_address) => {
//                 if (err) return res.status(500).json({ message: "Failed to fetch farmer address", error: err });

//                 // Insert order into database
//                 const orderSql = `
//                     INSERT INTO orders (customer_id, farmer_id, product_id, quantity, total_price, customer_address, farmer_address) 
//                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
                
//                 db.query(orderSql, [customer_id, farmer_id, product_id, quantity, total_price, customer_address, farmer_address], 
//                     (err, result) => {
//                         if (err) return res.status(500).json({ message: "Database error", error: err });
//                         res.status(201).json({ message: "Order placed successfully", order_id: result.insertId });
//                     });
//             });
//         });
//     });
// };

// // ✅ Get Order History (Customer)
// exports.getCustomerOrders = (req, res) => {
//     console.log("🟢 getCustomerOrders called");
//     const customer_id = req.user.id;

//     const sql = "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC";
//     db.query(sql, [customer_id], (err, results) => {
//         if (err) return res.status(500).json({ message: "Database error", error: err });
//         res.json({ orders: results });
//     });
// };

// // ✅ Get Order Requests (Farmer)
// exports.getFarmerOrders = (req, res) => {
//     console.log("🟢 getFarmerOrders called");
//     const farmer_id = req.user.id;

//     const sql = "SELECT * FROM orders WHERE farmer_id = ? ORDER BY created_at DESC";
//     db.query(sql, [farmer_id], (err, results) => {
//         if (err) return res.status(500).json({ message: "Database error", error: err });
//         res.json({ orders: results });
//     });
// };

// // ✅ Confirm Order (Farmer)
// exports.confirmOrder = (req, res) => {
//     console.log("🟢 confirmOrder called");
//     const { id } = req.params;
//     const farmer_id = req.user.id;

//     const sql = "UPDATE orders SET order_status = 'Confirmed' WHERE id = ? AND farmer_id = ?";
//     db.query(sql, [id, farmer_id], (err, result) => {
//         if (err) return res.status(500).json({ message: "Database error", error: err });
//         if (result.affectedRows === 0) return res.status(404).json({ message: "Order not found" });

//         res.json({ message: "Order confirmed successfully" });
//     });
// };

// // ✅ Update Order Status (Farmer)
// exports.updateOrderStatus = (req, res) => {
//     console.log("🟢 updateOrderStatus called");
//     const { id } = req.params;
//     const { order_status } = req.body;
//     const farmer_id = req.user.id;

//     const sql = "UPDATE orders SET order_status = ? WHERE id = ? AND farmer_id = ?";
//     db.query(sql, [order_status, id, farmer_id], (err, result) => {
//         if (err) return res.status(500).json({ message: "Database error", error: err });
//         if (result.affectedRows === 0) return res.status(404).json({ message: "Order not found" });

//         res.json({ message: "Order status updated successfully" });
//     });
// };

// // ✅ Cancel Order (Customer)
// exports.cancelOrder = (req, res) => {
//     console.log("🟢 cancelOrder called");
//     const { id } = req.params;
//     const customer_id = req.user.id;

//     const sql = "UPDATE orders SET order_status = 'Canceled' WHERE id = ? AND customer_id = ?";
//     db.query(sql, [id, customer_id], (err, result) => {
//         if (err) return res.status(500).json({ message: "Database error", error: err });
//         if (result.affectedRows === 0) return res.status(404).json({ message: "Order not found" });

//         res.json({ message: "Order has been canceled" });
//     });
// };



// // const db = require("../config/db");

// // // ✅ Place an Order (Customer)
// // exports.placeOrder = (req, res) => {
// //     console.log("🟢 placeOrder called");

// //     const { product_id, quantity, total_price, customer_address } = req.body;
// //     const customer_id = req.user.id;

// //     // Fetch farmer_id from the product table
// //     db.query("SELECT farmer_id, address FROM products WHERE id = ?", [product_id], (err, results) => {
// //         if (err) {
// //             console.error("❌ Database Error:", err);
// //             return res.status(500).json({ message: "Database error", error: err });
// //         }

// //         if (results.length === 0) {
// //             return res.status(404).json({ message: "Product not found" });
// //         }

// //         const farmer_id = results[0].farmer_id;
// //         const farmer_address = results[0].address;

// //         // Insert into orders table
// //         const sql = `INSERT INTO orders (customer_id, farmer_id, product_id, quantity, total_price, order_status, customer_address, farmer_address)
// //                      VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?)`;
// //         db.query(sql, [customer_id, farmer_id, product_id, quantity, total_price, customer_address, farmer_address], (err, result) => {
// //             if (err) {
// //                 console.error("❌ Database Error:", err);
// //                 return res.status(500).json({ message: "Database error", error: err });
// //             }

// //             console.log("✅ Order placed successfully:", result);
// //             res.status(201).json({ message: "Order placed successfully", order_id: result.insertId });
// //         });
// //     });
// // };

// // // ✅ Get Orders for Customer
// // exports.getCustomerOrders = (req, res) => {
// //     console.log("🟢 getCustomerOrders called");

// //     const customer_id = req.user.id;
// //     const sql = `SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC`;

// //     db.query(sql, [customer_id], (err, results) => {
// //         if (err) {
// //             console.error("❌ Database Error:", err);
// //             return res.status(500).json({ message: "Database error", error: err });
// //         }

// //         res.json({ orders: results });
// //     });
// // };

// // // ✅ Get Orders for Farmer
// // exports.getFarmerOrders = (req, res) => {
// //     console.log("🟢 getFarmerOrders called");

// //     const farmer_id = req.user.id;
// //     const sql = `SELECT * FROM orders WHERE farmer_id = ? ORDER BY created_at DESC`;

// //     db.query(sql, [farmer_id], (err, results) => {
// //         if (err) {
// //             console.error("❌ Database Error:", err);
// //             return res.status(500).json({ message: "Database error", error: err });
// //         }

// //         res.json({ orders: results });
// //     });
// // };

// // // ✅ Farmer Confirms Order
// // exports.confirmOrder = (req, res) => {
// //     console.log("🟢 confirmOrder called");

// //     const { order_id } = req.params;
// //     const farmer_id = req.user.id;

// //     const sql = `UPDATE orders SET order_status = 'Confirmed' WHERE id = ? AND farmer_id = ? AND order_status = 'Pending'`;
// //     db.query(sql, [order_id, farmer_id], (err, result) => {
// //         if (err) {
// //             console.error("❌ Database Error:", err);
// //             return res.status(500).json({ message: "Database error", error: err });
// //         }

// //         if (result.affectedRows === 0) {
// //             return res.status(400).json({ message: "Order not found or already confirmed" });
// //         }

// //         res.json({ message: "Order confirmed" });
// //     });
// // };

// // // ✅ Farmer Updates Order Status
// // exports.updateOrderStatus = (req, res) => {
// //     console.log("🟢 updateOrderStatus called");

// //     const { order_id } = req.params;
// //     const { order_status } = req.body;
// //     const farmer_id = req.user.id;

// //     const allowedStatuses = ["Shipped", "Delivered"];
// //     if (!allowedStatuses.includes(order_status)) {
// //         return res.status(400).json({ message: "Invalid order status" });
// //     }

// //     const sql = `UPDATE orders SET order_status = ? WHERE id = ? AND farmer_id = ? AND order_status NOT IN ('Canceled')`;
// //     db.query(sql, [order_status, order_id, farmer_id], (err, result) => {
// //         if (err) {
// //             console.error("❌ Database Error:", err);
// //             return res.status(500).json({ message: "Database error", error: err });
// //         }

// //         if (result.affectedRows === 0) {
// //             return res.status(400).json({ message: "Order not found or cannot update status" });
// //         }

// //         res.json({ message: `Order marked as ${order_status}` });
// //     });
// // };

// // // ✅ Customer Cancels Order
// // exports.cancelOrder = (req, res) => {
// //     console.log("🟢 cancelOrder called");

// //     const { order_id } = req.params;
// //     const customer_id = req.user.id;

// //     const sql = `UPDATE orders SET order_status = 'Canceled' WHERE id = ? AND customer_id = ? AND order_status = 'Pending'`;
// //     db.query(sql, [order_id, customer_id], (err, result) => {
// //         if (err) {
// //             console.error("❌ Database Error:", err);
// //             return res.status(500).json({ message: "Database error", error: err });
// //         }

// //         if (result.affectedRows === 0) {
// //             return res.status(400).json({ message: "Order not found or cannot be canceled" });
// //         }

// //         res.json({ message: "Order canceled successfully" });
// //     });
// // };
