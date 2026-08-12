const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middleware/authMiddleware');
router.post('/', orderController.createOrder); // Public route for customers placing orders
router.get('/', verifyToken, orderController.getOrders);
router.put('/mark-read', verifyToken, orderController.markOrdersAsRead);
router.put('/:id/mark-read', verifyToken, orderController.markSingleOrderAsRead);
router.put('/:id/status', verifyToken, orderController.updateOrderStatus);
router.put('/:id/payment-status', verifyToken, orderController.updatePaymentStatus);
router.put('/:id/items', verifyToken, orderController.updateOrderItems);
router.delete('/:id', verifyToken, orderController.deleteOrder);

module.exports = router;
