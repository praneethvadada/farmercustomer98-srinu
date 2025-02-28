const db = require("../config/db");
 
// ✅ Add Product
const createProduct = (productData, callback) => {
    const sql = `INSERT INTO products (farmer_id, name, description, price, quantity, available_quantity, category, image_url, availability, crop_stage) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, productData, callback);
};

// ✅ Get ALL Products (For Customers)
const getAllProducts = (callback) => {
    db.query("SELECT * FROM products WHERE availability = 'in stock'", callback);
};

// ✅ Get Products for a Specific Farmer
const getProductsByFarmer = (farmerId, callback) => {
    const sql = "SELECT * FROM products WHERE farmer_id = ?";
    db.query(sql, [farmerId], callback);
};

// ✅ Get a Product By ID
const getProductById = (id, callback) => {
    db.query("SELECT * FROM products WHERE id = ?", [id], callback);
};

// ✅ Update a Product
const updateProduct = (id, updates, callback) => {
    const sql = `UPDATE products SET name = ?, description = ?, price = ?, quantity = ?, available_quantity = ?, category = ?, image_url = ?, availability = ?, crop_stage = ? WHERE id = ?`;
    db.query(sql, [...updates, id], callback);
};

// ✅ Delete a Product
const deleteProduct = (id, callback) => {
    db.query("DELETE FROM products WHERE id = ?", [id], callback);
};

// const getAllProductsWithCart = (customer_id, callback) => {
//     const sql = `
//         SELECT 
//         p.id, p.farmer_id, p.name, p.description, p.price, p.quantity, p.available_quantity, 
//         p.category, p.image_url, p.availability, p.crop_stage, 
//         IFNULL(c.quantity, 0) AS cart_quantity
//         FROM products p
//         LEFT JOIN cart c 
//         ON p.id = c.product_id AND c.customer_id = ?
//         WHERE p.availability = 'in stock'
//     `;

//     console.log("🟢 Executing SQL Query for getAllProductsWithCart()");
//     console.log("🟢 Using customer_id:", customer_id);
//     console.log("🟢 SQL Query:", sql);

//     db.query(sql, [customer_id], (err, results) => {
//         if (err) {
//             console.error("❌ Database Error:", err);
//             return callback(err, null);
//         }
//         console.log("🟢 Raw Query Results:", results);
//         results.forEach(product => {
//             console.log(`🔹 Product ID: ${product.id}, Cart Quantity: ${product.cart_quantity}`);
//         });
//         console.log("🟢 Query Results from Database:", JSON.stringify(results, null, 2)); // Debugging Log
//         callback(null, results);
//     });
// };



const getAllProductsWithCart = (customer_id, callback) => {
    const sql = `
        SELECT 
            p.id, p.farmer_id, p.name, p.description, p.price, p.quantity, p.available_quantity, 
            p.category, p.image_url, p.availability, p.crop_stage, 
            IFNULL(c.quantity, 0) AS cart_quantity
        FROM products p
        LEFT JOIN cart c 
        ON p.id = c.product_id AND c.customer_id = ?
        WHERE p.availability = 'in stock'
    `;

    console.log("🟢 Running SQL Query with customer_id:", customer_id);
    console.log("🟢 SQL Query:", sql);

    db.query(sql, [customer_id], (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return callback(err, null);
        }

        console.log("🟢 Database Query Result:", JSON.stringify(results, null, 2));

        // Debug each product's cart quantity
        results.forEach(product => {
            console.log(`🛒 Product ID: ${product.id}, Cart Quantity: ${product.cart_quantity}`);
        });

        callback(null, results);
    });
};

module.exports = { createProduct, getAllProducts, getProductsByFarmer, getProductById, updateProduct, deleteProduct, getAllProductsWithCart };
