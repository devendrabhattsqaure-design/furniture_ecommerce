const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrder, cancelOrder
} = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:orderId', protect, getOrder);
router.put('/:orderId/cancel', protect, cancelOrder);

module.exports = router;