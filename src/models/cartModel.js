const db = require('../config/db');

const Cart = {
    addToCart: (customer_id, product_id, quantity, callback) => {
        db.query(
            `INSERT INTO cart (customer_id, product_id, quantity) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
            [customer_id, product_id, quantity],
            callback
        );
    },

    getCart: (customer_id, callback) => {
        db.query(
            `SELECT c.id, c.product_id, p.name, c.quantity, p.price, (c.quantity * p.price) as subtotal
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.customer_id = ?`,
            [customer_id],
            callback
        );
    },

     // ✅ Get the current quantity of the item in the cart
    //  getCartItem: (cart_id, customer_id, callback) => {
    //     db.query("SELECT quantity FROM cart WHERE id = ? AND customer_id = ?", [cart_id, customer_id], callback);
    // },
    // getCartItem: (product_id, customer_id, callback) => {
    //     db.query("SELECT quantity FROM cart WHERE product_id = ? AND customer_id = ?", [product_id, customer_id], callback);
    // },
    

    // decrementCartItem: (cart_id, customer_id, callback) => {
    //     db.query("UPDATE cart SET quantity = quantity - 1 WHERE id = ? AND customer_id = ?", [cart_id, customer_id], callback);
    // },
    // decrementCartItem: (product_id, customer_id, callback) => {
    //     db.query(
    //         "UPDATE cart SET quantity = quantity - 1 WHERE product_id = ? AND customer_id = ? AND quantity > 0",
    //         [product_id, customer_id],
    //         callback
    //     );
    // },
    
    // ✅ Remove item completely if quantity reaches 0
    // removeFromCart: (cart_id, customer_id, callback) => {
    //     db.query("DELETE FROM cart WHERE id = ? AND customer_id = ?", [cart_id, customer_id], callback);
    // }
    // removeFromCart: (product_id, customer_id, callback) => {
    //     db.query("DELETE FROM cart WHERE product_id = ? AND customer_id = ?", [product_id, customer_id], callback);
    // }


    getCartItem: (product_id, customer_id, callback) => {
        db.query("SELECT quantity FROM cart WHERE product_id = ? AND customer_id = ?", [product_id, customer_id], callback);
    },

    // ✅ Decrement quantity if greater than 1
    decrementCartItem: (product_id, customer_id, callback) => {
        db.query("UPDATE cart SET quantity = quantity - 1 WHERE product_id = ? AND customer_id = ?", [product_id, customer_id], callback);
    },

    // ✅ Remove item completely if quantity reaches 0
    removeFromCart: (product_id, customer_id, callback) => {
        db.query("DELETE FROM cart WHERE product_id = ? AND customer_id = ?", [product_id, customer_id], callback);
    }
};

module.exports = Cart;
