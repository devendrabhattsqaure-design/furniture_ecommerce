const db = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Get all addresses for a user
// @route   GET /api/addresses
exports.getUserAddresses = asyncHandler(async (req, res) => {
  const [addresses] = await db.query(
    `SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`,
    [req.user.id]
  );

  res.json({
    success: true,
    addresses
  });
});

// @desc    Get single address
// @route   GET /api/addresses/:id
exports.getAddress = asyncHandler(async (req, res) => {
  const [addresses] = await db.query(
    `SELECT * FROM user_addresses WHERE address_id = ? AND user_id = ?`,
    [req.params.id, req.user.id]
  );

  if (addresses.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  res.json({
    success: true,
    address: addresses[0]
  });
});

// @desc    Create new address
// @route   POST /api/addresses
exports.createAddress = asyncHandler(async (req, res) => {
  const {
    address_type,
    phone,
    address_line1,
    landmark,
    city,
    postal_code,
    is_default
  } = req.body;

  // If setting as default, remove default from other addresses
  if (is_default) {
    await db.query(
      'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
      [req.user.id]
    );
  }

  const [result] = await db.query(
    `INSERT INTO user_addresses 
     (user_id, address_type, phone, address_line1, landmark, city, postal_code, is_default) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      address_type,
      phone,
      address_line1,
      landmark,
      city,
      postal_code,
      is_default || 0
    ]
  );

  const [addresses] = await db.query(
    `SELECT * FROM user_addresses WHERE address_id = ?`,
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    message: 'Address created successfully',
    address: addresses[0]
  });
});

// @desc    Update address
// @route   PUT /api/addresses/:id
exports.updateAddress = asyncHandler(async (req, res) => {
  // Check if address exists and belongs to user
  const [existingAddress] = await db.query(
    'SELECT * FROM user_addresses WHERE address_id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );

  if (existingAddress.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  const {
    address_type,
    phone,
    address_line1,
    landmark,
    city,
    postal_code,
    is_default
  } = req.body;

  // If setting as default, remove default from other addresses
  if (is_default) {
    await db.query(
      'UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND address_id != ?',
      [req.user.id, req.params.id]
    );
  }

  await db.query(
    `UPDATE user_addresses 
     SET address_type = ?, phone = ?, address_line1 = ?, landmark = ?, 
         city = ?, postal_code = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE address_id = ? AND user_id = ?`,
    [
      address_type,
      phone,
      address_line1,
      landmark,
      city,
      postal_code,
      is_default || 0,
      req.params.id,
      req.user.id
    ]
  );

  const [updatedAddress] = await db.query(
    `SELECT * FROM user_addresses WHERE address_id = ?`,
    [req.params.id]
  );

  res.json({
    success: true,
    message: 'Address updated successfully',
    address: updatedAddress[0]
  });
});

// @desc    Delete address
// @route   DELETE /api/addresses/:id
exports.deleteAddress = asyncHandler(async (req, res) => {
  // Check if address exists and belongs to user
  const [existingAddress] = await db.query(
    'SELECT * FROM user_addresses WHERE address_id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );

  if (existingAddress.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  await db.query(
    'DELETE FROM user_addresses WHERE address_id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );

  res.json({
    success: true,
    message: 'Address deleted successfully'
  });
});

// @desc    Set address as default
// @route   PATCH /api/addresses/:id/set-default
exports.setDefaultAddress = asyncHandler(async (req, res) => {
  // Check if address exists and belongs to user
  const [existingAddress] = await db.query(
    'SELECT * FROM user_addresses WHERE address_id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );

  if (existingAddress.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  // Remove default from all addresses
  await db.query(
    'UPDATE user_addresses SET is_default = 0 WHERE user_id = ?',
    [req.user.id]
  );

  // Set this address as default
  await db.query(
    'UPDATE user_addresses SET is_default = 1 WHERE address_id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );

  const [updatedAddress] = await db.query(
    `SELECT * FROM user_addresses WHERE address_id = ?`,
    [req.params.id]
  );

  res.json({
    success: true,
    message: 'Address set as default successfully',
    address: updatedAddress[0]
  });
});