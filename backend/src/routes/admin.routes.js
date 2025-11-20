const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');

// Dashboard
const { getDashboardStats, getSalesChart } = require('../controllers/admin/dashboard.controller');
router.get('/dashboard/stats', protect, authorize('admin', 'employee'), getDashboardStats);
router.get('/dashboard/sales-chart', protect, authorize('admin', 'employee'), getSalesChart);

// Orders
const { getAllOrders, updateOrderStatus } = require('../controllers/admin/order.controller');
router.get('/orders', protect, authorize('admin', 'employee'), getAllOrders);
router.put('/orders/:orderId/status', protect, authorize('admin', 'employee'), updateOrderStatus);

// Users
const { getAllUsers, updateUserStatus, deleteUser } = require('../controllers/admin/user.controller');
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:userId/status', protect, authorize('admin'), updateUserStatus);
router.delete('/users/:userId', protect, authorize('admin'), deleteUser);

module.exports = router;