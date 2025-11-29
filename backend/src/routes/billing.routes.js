// billing.routes.js
const express = require('express');
const router = express.Router();
const {
  createBill,
  getAllBills,
  getBill,
  searchProducts,
  getBillingStatistics
} = require('../controllers/billing.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.post('/', protect, createBill);
router.get('/', protect, getAllBills);
router.get('/statistics', protect, getBillingStatistics);
router.get('/products/search', protect, searchProducts);
router.get('/:id', protect, getBill);

module.exports = router;