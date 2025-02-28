const db = require('../config/db');

const Order = {
    createOrder: (customer_id, total_price, payment_method, callback) => {
        db.query(
            'INSERT INTO orders (customer_id, total_price, payment_method, status) VALUES (?, ?, ?, "pending")',
            [customer_id, total_price, payment_method],
            callback
        );
    },

    insertOrderItems: (items, callback) => {
        const values = items.map(item => [item.order_id, item.product_id, item.farmer_id, item.quantity, item.price]);
        db.query(
            'INSERT INTO order_items (order_id, product_id, farmer_id, quantity, price) VALUES ?',
            [values],
            callback
        );
    },

    getOrdersByCustomer: (customer_id, callback) => {
        db.query(
            `SELECT orders.id, orders.status, orders.total_price, orders.created_at,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'product_name', products.name,
                    'quantity', order_items.quantity,
                    'price', order_items.price
                )
            ) AS items
            FROM orders
            JOIN order_items ON orders.id = order_items.order_id
            JOIN products ON order_items.product_id = products.id
            WHERE orders.customer_id = ?
            GROUP BY orders.id`,
            [customer_id],
            callback
        );
    },

    cancelOrder: (order_id, customer_id, callback) => {
        db.query(
            'UPDATE orders SET status = "cancelled" WHERE id = ? AND customer_id = ?',
            [order_id, customer_id],
            callback
        );
    },

    getOrderStatus: (order_id, callback) => {
        db.query(
            'SELECT status FROM orders WHERE id = ?',
            [order_id],
            callback
        );
    }
};

module.exports = Order;
