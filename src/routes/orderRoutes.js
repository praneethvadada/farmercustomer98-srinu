const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

router.post("/place", authMiddleware, orderController.placeOrder);
router.get("/history", authMiddleware, orderController.getCustomerOrders);
router.get("/requests", authMiddleware, orderController.getFarmerOrders);
router.put("/confirm/:id", authMiddleware, orderController.confirmOrder);
router.put("/update/:id", authMiddleware, orderController.updateOrderStatus);
router.put("/cancel/:id", authMiddleware, orderController.cancelOrder);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const authMiddleware = require("../middleware/authMiddleware");
// const orderController = require("../controllers/orderController");

// // Customer places an order
// router.post("/place", authMiddleware, orderController.placeOrder);

// // Customer views their order history
// router.get("/history", authMiddleware, orderController.getCustomerOrders);

// // Farmer views incoming order requests
// router.get("/requests", authMiddleware, orderController.getFarmerOrders);

// // Farmer confirms an order
// router.put("/confirm/:id", authMiddleware, orderController.confirmOrder);

// // Farmer updates order status
// router.put("/update/:id", authMiddleware, orderController.updateOrderStatus);

// // Customer cancels an order
// router.put("/cancel/:id", authMiddleware, orderController.cancelOrder);

// module.exports = router;


// // const express = require("express");
// // const router = express.Router();
// // const authMiddleware = require("../middleware/authMiddleware");
// // const orderController = require("../controllers/orderController");

// // // Customer places an order
// // router.post("/place", authMiddleware, orderController.placeOrder);

// // // Customer views order history
// // router.get("/", authMiddleware, orderController.getCustomerOrders);

// // // Farmer views orders
// // router.get("/farmer", authMiddleware, orderController.getFarmerOrders);

// // // Farmer confirms order
// // router.put("/confirm/:order_id", authMiddleware, orderController.confirmOrder);

// // // Farmer updates order status
// // router.put("/update-status/:order_id", authMiddleware, orderController.updateOrderStatus);

// // // Customer cancels order
// // router.put("/cancel/:order_id", authMiddleware, orderController.cancelOrder);

// // module.exports = router;
