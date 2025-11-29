const db = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Set user target and incentive
// @route   POST /api/user-targets
exports.setUserTarget = asyncHandler(async (req, res) => {
  const { user_id, target_amount, incentive_percentage, effective_date } = req.body;

  if (!user_id || !target_amount || !incentive_percentage || !effective_date) {
    return res.status(400).json({
      success: false,
      message: 'user_id, target_amount, incentive_percentage, and effective_date are required'
    });
  }

  // Check if user exists
  const [users] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [user_id]);
  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Calculate incentive amount
  const incentiveAmount = (parseFloat(target_amount) * parseFloat(incentive_percentage)) / 100;

  // Check if target already exists for this date
  const [existing] = await db.query(
    'SELECT * FROM user_targets WHERE user_id = ? AND effective_date = ?',
    [user_id, effective_date]
  );

  if (existing.length > 0) {
    // Update existing target
    await db.query(
      `UPDATE user_targets 
       SET target_amount = ?, incentive_percentage = ?, incentive_amount = ?, updated_at = NOW()
       WHERE target_id = ?`,
      [target_amount, incentive_percentage, incentiveAmount, existing[0].target_id]
    );
  } else {
    // Create new target
    await db.query(
      `INSERT INTO user_targets (user_id, target_amount, incentive_percentage, incentive_amount, effective_date)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, target_amount, incentive_percentage, incentiveAmount, effective_date]
    );
  }

  res.json({
    success: true,
    message: 'User target set successfully'
  });
});

// @desc    Get user targets
// @route   GET /api/user-targets/:user_id
exports.getUserTargets = asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  const [targets] = await db.query(
    `SELECT target_id, user_id, target_amount, incentive_percentage, incentive_amount, 
            effective_date, created_at, updated_at
     FROM user_targets 
     WHERE user_id = ? 
     ORDER BY effective_date DESC`,
    [user_id]
  );

  res.json({
    success: true,
    targets
  });
});

// @desc    Get current user target
// @route   GET /api/user-targets/:user_id/current
exports.getCurrentUserTarget = asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  const [targets] = await db.query(
    `SELECT target_id, user_id, target_amount, incentive_percentage, incentive_amount, 
            effective_date, created_at, updated_at
     FROM user_targets 
     WHERE user_id = ? AND effective_date <= CURDATE()
     ORDER BY effective_date DESC 
     LIMIT 1`,
    [user_id]
  );

  res.json({
    success: true,
    target: targets[0] || null
  });
});