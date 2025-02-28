const { createProduct, getAllProducts, getProductsByFarmer, getProductById, updateProduct, deleteProduct, getAllProductsWithCart } = require("../models/productModel");

exports.addProduct = (req, res) => {
    console.log("🔹 Add Product API Called");
    console.log("➡️ Incoming Headers:", req.headers);
    console.log("➡️ Incoming Request Body:", req.body);
    console.log("➡️ Uploaded File:", req.file);

    if (req.user.role !== "farmer") {
        return res.status(403).json({ message: "Only farmers can add products." });
    }

    // ✅ Print all expected fields
    console.log("🔍 Extracted Fields:");
    console.log("  - name:", req.body.name);
    console.log("  - description:", req.body.description);
    console.log("  - price:", req.body.price);
    console.log("  - quantity:", req.body.quantity);
    console.log("  - available_quantity:", req.body.available_quantity);
    console.log("  - category:", req.body.category);
    console.log("  - availability:", req.body.availability);
    console.log("  - crop_stage:", req.body.crop_stage);
    console.log("  - image_file:", req.file ? req.file.filename : "No image uploaded");

    const { name, description, price, quantity, available_quantity, category, availability, crop_stage } = req.body;
    const farmer_id = req.user.id;
    const image_url = req.file ? req.file.filename : null;

    if (!name || !price || !quantity || !available_quantity || !crop_stage) {
        console.log("❌ Missing Required Fields:");
        console.log({ name, price, quantity, available_quantity, crop_stage });
        return res.status(400).json({ message: "Missing required fields." });
    }

    console.log("✅ All required fields are present, proceeding to create product.");

    createProduct(
        [farmer_id, name, description, price, quantity, available_quantity, category, image_url, availability || 'in stock', crop_stage],
        (err, result) => {
            if (err) {
                console.error("❌ Database Error:", err.message);
                return res.status(500).json({ message: err.message });
            }
            console.log("✅ Product added successfully:", result);
            res.status(201).json({ message: "Product added successfully." });
        }
    );
};


// exports.getAllProducts = (req, res) => {
//     console.log("🟢 getAllProducts() called");

//     // Extract customer_id from JWT
//     // const customer_id = req.user?.id;
//     if (!req.user || !req.user.id) {
//         console.error("❌ Unauthorized: Missing or Invalid Token");
//         return res.status(401).json({ message: "Unauthorized: Invalid token" });
//     }
//     const customer_id = req.user.id;
    
//     console.log("🟢 Extracted customer_id from JWT:", customer_id);

//     if (!customer_id) {
//         console.error("❌ Unauthorized: Missing or Invalid Token");
//         return res.status(401).json({ message: "Unauthorized: Invalid token" });
//     }

//     console.log("🟢 Calling getAllProductsWithCart() with customer_id:", customer_id);

//     getAllProductsWithCart(customer_id, (err, results) => {
//         if (err) {
//             console.error("❌ Database Error:", err);
//             return res.status(500).json({ message: "Database error", error: err });
//         }

//         console.log("🟢 Final API Response Sent:", JSON.stringify({ products: results }, null, 2));
//         res.json({ products: results });
//     });
// };


exports.getAllProducts = (req, res) => {
    console.log("🟢 getAllProducts() called");

    // Extract customer_id from JWT
    const customer_id = req.user?.id;
    console.log("🟢 Extracted customer_id from JWT:", customer_id);

    if (!customer_id) {
        console.error("❌ Unauthorized: Missing or Invalid Token");
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    console.log("🟢 Fetching products with customer_id:", customer_id);

    getAllProductsWithCart(customer_id, (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        console.log("🟢 Final API Response Sent:", JSON.stringify({ products: results }, null, 2));
        res.json({ products: results });
    });
};






// exports.getAllProducts = (req, res) => {
//     getAllProducts((err, results) => {
//         if (err) return res.status(500).json({ message: err.message });
//         res.json(results);
//     });
// };

exports.getFarmerProducts = (req, res) => {
    if (req.user.role !== "farmer") {
        return res.status(403).json({ message: "Only farmers can access their products." });
    }

    const farmerId = req.user.id;
    getProductsByFarmer(farmerId, (err, results) => {
        if (err) return res.status(500).json({ message: err.message });

        if (results.length === 0) {
            return res.status(404).json({ message: "No products found for this farmer." });
        }

        res.json({ products: results });
    });
};

exports.getProduct = (req, res) => {
    const { id } = req.params;
    getProductById(id, (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json(results[0]);
    });
};




exports.updateProduct = (req, res) => {
    console.log("🔹 Update Product API Called");
    console.log("➡️ Incoming Headers:", req.headers);
    console.log("➡️ Incoming Request Body:", req.body);
    console.log("➡️ Uploaded File:", req.file);

    if (req.user.role !== "farmer") {
        console.log("❌ Access Denied: Only farmers can update products.");
        return res.status(403).json({ message: "Only farmers can update products." });
    }

    const { id } = req.params;
    console.log("➡️ Product ID:", id);

    // ✅ Extract fields from request body
    const { name, description, price, quantity, available_quantity, category, availability, crop_stage } = req.body;
    const image_url = req.file ? req.file.filename : req.body.image_url;

    console.log("🔍 Extracted Fields:");
    console.log("  - name:", name);
    console.log("  - description:", description);
    console.log("  - price:", price);
    console.log("  - quantity:", quantity);
    console.log("  - available_quantity:", available_quantity);
    console.log("  - category:", category);
    console.log("  - availability:", availability);
    console.log("  - crop_stage:", crop_stage);
    console.log("  - image_url:", image_url ? image_url : "No image uploaded");

    if (!name || !price || !quantity || !available_quantity || !crop_stage) {
        console.log("❌ Missing Required Fields:", { name, price, quantity, available_quantity, crop_stage });
        return res.status(400).json({ message: "Missing required fields." });
    }

    console.log("✅ All required fields are present, proceeding to update product.");

    updateProduct(id, [name, description, price, quantity, available_quantity, category, image_url, availability, crop_stage], (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err.message);
            return res.status(500).json({ message: err.message });
        }
        console.log("✅ Product updated successfully:", result);
        res.json({ message: "Product updated successfully." });
    });
};


exports.deleteProduct = (req, res) => {
    if (req.user.role !== "farmer") {
        return res.status(403).json({ message: "Only farmers can delete products." });
    }

    const { id } = req.params;
    deleteProduct(id, (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: "Product deleted successfully." });
    });
};


exports.advancedSearchProducts = (req, res) => {
    console.log("🟢 advancedSearchProducts API called!");

    const { query } = req.query;

    if (!query) {
        console.warn("⚠️ Search query is missing");
        return res.status(400).json({ message: "Search query is required." });
    }

    console.log("🟢 Searching for:", query);

    // SQL Query: Match products dynamically across name, description, and category
    const sql = `
        SELECT * FROM products 
        WHERE LOWER(name) LIKE LOWER(?) 
        OR LOWER(description) LIKE LOWER(?) 
        OR LOWER(category) LIKE LOWER(?)
        ORDER BY created_at DESC
        LIMIT 20`;

    const searchQuery = `%${query}%`; // Wildcard for partial matching

    console.log("🟢 Executing SQL Query:", sql);
    console.log("🟢 Using Search Query:", searchQuery);

    db.query(sql, [searchQuery, searchQuery, searchQuery], (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        console.log("✅ Search Results Found:", results.length);
        res.json({ products: results });
    });
};
