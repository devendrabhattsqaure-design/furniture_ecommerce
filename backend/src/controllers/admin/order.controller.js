const db = require('../../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, payment_status, search } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND order_status = ?';
    params.push(status);
  }
  if (payment_status) {
    query += ' AND payment_status = ?';
    params.push(payment_status);
  }
  if (search) {
    query += ' AND order_number LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [orders] = await db.query(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
  const countParams = [];
  if (status) {
    countQuery += ' AND order_status = ?';
    countParams.push(status);
  }
  if (payment_status) {
    countQuery += ' AND payment_status = ?';
    countParams.push(payment_status);
  }

  const [countResult] = await db.query(countQuery, countParams);
  const total = countResult[0].total;

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:orderId/status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, notes } = req.body;

  await db.query(
    'UPDATE orders SET order_status = ?, updated_at = NOW() WHERE order_id = ?',
    [status, orderId]
  );

  // Add tracking entry
  await db.query(
    'INSERT INTO order_tracking (order_id, status, notes, created_by) VALUES (?, ?, ?, ?)',
    [orderId, status, notes, req.user.id]
  );

  res.json({ success: true, message: 'Order status updated successfully' });
});