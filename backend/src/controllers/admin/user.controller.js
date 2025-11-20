const db = require('../../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, status, search } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT user_id, email, full_name, phone, role, status, email_verified, created_at FROM users WHERE 1=1';
  const params = [];

  if (role) {
    query += ' AND role = ?';
    params.push(role);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    query += ' AND (full_name LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [users] = await db.query(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
  const countParams = [];
  if (role) {
    countQuery += ' AND role = ?';
    countParams.push(role);
  }
  if (status) {
    countQuery += ' AND status = ?';
    countParams.push(status);
  }

  const [countResult] = await db.query(countQuery, countParams);
  const total = countResult[0].total;

  res.json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Update user status
// @route   PUT /api/admin/users/:userId/status
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  await db.query('UPDATE users SET status = ? WHERE user_id = ?', [status, userId]);

  res.json({ success: true, message: 'User status updated successfully' });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:userId
exports.deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  await db.query('DELETE FROM users WHERE user_id = ?', [userId]);

  res.json({ success: true, message: 'User deleted successfully' });
});