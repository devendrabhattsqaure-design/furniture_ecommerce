const express = require('express');
const router = express.Router();
const {
  getUserAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/address.controller');
const { protect } = require('../middlewares/auth.middleware');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getUserAddresses)
  .post(createAddress);

router.route('/:id')
  .get(getAddress)
  .put(updateAddress)
  .delete(deleteAddress);

router.patch('/:id/set-default', setDefaultAddress);

module.exports = router;