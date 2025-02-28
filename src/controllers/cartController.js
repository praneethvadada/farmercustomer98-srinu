const Cart = require('../models/cartModel');

const addToCart = (req, res) => {
    console.log("🟢 addToCart called");
    const { product_id, quantity } = req.body;
    const customer_id = req.user.id;

    if (!product_id || !quantity || quantity <= 0) {
        return res.status(400).json({ message: "Invalid product or quantity" });
    }

    Cart.addToCart(customer_id, product_id, quantity, (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        res.json({ message: 'Product added to cart successfully' });
    });
};

const getCart = (req, res) => {
    console.log("🟢 getCart called");
    const customer_id = req.user.id;

    Cart.getCart(customer_id, (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        res.json({ cart: result });
    });
};

// const removeFromCart = (req, res) => {
//     console.log("🟢 removeFromCart called");
//     const cart_id = req.params.id;
//     const customer_id = req.user.id;

//     Cart.removeFromCart(cart_id, customer_id, (err, result) => {
//         if (err) return res.status(500).json({ message: 'Database error', error: err });

//         res.json({ message: 'Product removed from cart' });
//     });
// };

// const removeFromCart = (req, res) => {
//     console.log("🟢 removeFromCart called");
//     const cart_id = req.params.id;
//     const customer_id = req.user.id;

//     // First, check the current quantity
//     Cart.getCartItem(cart_id, customer_id, (err, result) => {
//         if (err) {
//             console.error("❌ Database Error:", err);
//             return res.status(500).json({ message: "Database error", error: err });
//         }

//         if (result.length === 0) {
//             return res.status(404).json({ message: "Product not found in cart" });
//         }

//         const currentQuantity = result[0].quantity;

//         if (currentQuantity > 1) {
//             // Decrement quantity if more than 1
//             Cart.decrementCartItem(cart_id, customer_id, (err, result) => {
//                 if (err) {
//                     console.error("❌ Database Error:", err);
//                     return res.status(500).json({ message: "Database error", error: err });
//                 }
//                 res.json({ message: "Product quantity decremented" });
//             });
//         } else {
//             // Remove the product if quantity is 1
//             Cart.removeFromCart(cart_id, customer_id, (err, result) => {
//                 if (err) {
//                     console.error("❌ Database Error:", err);
//                     return res.status(500).json({ message: "Database error", error: err });
//                 }
//                 res.json({ message: "Product removed from cart" });
//             });
//         }
//     });
// };

// const removeFromCart = (req, res) => {
//     console.log("🟢 removeFromCart called");
//     const product_id = req.params.product_id; // ✅ Get product_id from URL
//     const customer_id = req.user.id; // ✅ Get customer_id from JWT

//     // ✅ Check if the product exists in the cart
//     Cart.getCartItem(product_id, customer_id, (err, result) => {
//         if (err) {
//             console.error("❌ Database Error:", err);
//             return res.status(500).json({ message: "Database error", error: err });
//         }

//         if (result.length === 0) {
//             return res.status(404).json({ message: "Product not found in cart" });
//         }

//         const currentQuantity = result[0].quantity;

//         if (currentQuantity > 1) {
//             // ✅ Decrease quantity if more than 1
//             Cart.decrementCartItem(product_id, customer_id, (err, result) => {
//                 if (err) {
//                     console.error("❌ Database Error:", err);
//                     return res.status(500).json({ message: "Database error", error: err });
//                 }
//                 res.json({ message: "Product quantity decremented" });
//             });
//         } else {
//             // ✅ Remove the product if quantity is 1
//             Cart.removeFromCart(product_id, customer_id, (err, result) => {
//                 if (err) {
//                     console.error("❌ Database Error:", err);
//                     return res.status(500).json({ message: "Database error", error: err });
//                 }
//                 res.json({ message: "Product removed from cart" });
//             });
//         }
//     });
// };

const removeFromCart = (req, res) => {
    console.log("🟢 removeFromCart called");
    const product_id = req.params.product_id;
    const customer_id = req.user.id;

    console.log(`🟢 Removing product_id: ${product_id} for customer_id: ${customer_id}`);

    Cart.getCartItem(product_id, customer_id, (err, result) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        console.log("🟢 Cart Query Result:", result);

        if (result.length === 0) {
            console.warn(`🚨 Product ${product_id} not found in cart for user ${customer_id}`);
            return res.status(404).json({ message: "Product not found in cart" });
        }

        const currentQuantity = result[0].quantity;
        console.log(`🟢 Current quantity: ${currentQuantity}`);

        if (currentQuantity > 1) {
            Cart.decrementCartItem(product_id, customer_id, (err, result) => {
                if (err) {
                    console.error("❌ Database Error:", err);
                    return res.status(500).json({ message: "Database error", error: err });
                }
                console.log("🟢 Product quantity decremented");
                res.json({ message: "Product quantity decremented" });
            });
        } else {
            Cart.removeFromCart(product_id, customer_id, (err, result) => {
                if (err) {
                    console.error("❌ Database Error:", err);
                    return res.status(500).json({ message: "Database error", error: err });
                }
                console.log("🟢 Product completely removed from cart");
                res.json({ message: "Product removed from cart" });
            });
        }
    });
};

// ✅ Ensure the module exports the functions properly
module.exports = {
    addToCart,
    getCart,
    removeFromCart
};

// const Cart = require('../models/cartModel');

// exports.addToCart = (req, res) => {
//     const { product_id, quantity } = req.body;
//     const customer_id = req.user.id;

//     if (!product_id || !quantity || quantity <= 0) {
//         return res.status(400).json({ message: "Invalid product or quantity" });
//     }

//     Cart.addToCart(customer_id, product_id, quantity, (err, result) => {
//         if (err) return res.status(500).json({ message: 'Database error', error: err });

//         res.json({ message: 'Product added to cart successfully' });
//     });
// };

// exports.getCart = (req, res) => {
//     const customer_id = req.user.id;

//     Cart.getCart(customer_id, (err, result) => {
//         if (err) return res.status(500).json({ message: 'Database error', error: err });

//         res.json({ cart: result });
//     });
// };

// exports.removeFromCart = (req, res) => {
//     const cart_id = req.params.id;
//     const customer_id = req.user.id;

//     Cart.removeFromCart(cart_id, customer_id, (err, result) => {
//         if (err) return res.status(500).json({ message: 'Database error', error: err });

//         res.json({ message: 'Product removed from cart' });
//     });
// };
