const express = require('express');
const router = express.Router();
const {
  setUserTarget,
  getUserTargets,
  getCurrentUserTarget
} = require('../controllers/target.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.post('/', protect, authorize('admin', 'manager'), setUserTarget);
router.get('/:user_id', protect, authorize('admin', 'manager'), getUserTargets);
router.get('/:user_id/current', protect, authorize('admin', 'manager'), getCurrentUserTarget);

module.exports = router;