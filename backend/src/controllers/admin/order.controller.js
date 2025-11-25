// backend/src/controllers/admin/order.controller.js
const db = require('../../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT 
      o.*,
      u.full_name as customer_name,
      u.email as customer_email,
      u.phone as customer_phone,
      ua.address_line1,
      ua.city,
      ua.postal_code
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    LEFT JOIN user_addresses ua ON o.shipping_address_id = ua.address_id
    WHERE 1=1
  `;
  const params = [];

  if (status && status !== 'all') {
    query += ' AND o.order_status = ?';
    params.push(status);
  }
  if (search) {
    query += ' AND (o.order_number LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [orders] = await db.query(query, params);

  // Get order items for each order
  for (let order of orders) {
    const [items] = await db.query(`
      SELECT 
        oi.*,
        p.product_name,
        p.sku,
        pi.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
      WHERE oi.order_id = ?
    `, [order.order_id]);
    
    order.items = items;
  }

  // Get total count
  let countQuery = `
    SELECT COUNT(*) as total 
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    WHERE 1=1
  `;
  const countParams = [];
  
  if (status && status !== 'all') {
    countQuery += ' AND o.order_status = ?';
    countParams.push(status);
  }
  if (search) {
    countQuery += ' AND (o.order_number LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)';
    countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const [countResult] = await db.query(countQuery, countParams);
  const total = countResult[0].total;

  res.json({
    success: true,
    orders: orders, // This is the key - sending as "orders"
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

  // Check if order exists
  const [orders] = await db.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
  if (orders.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  await db.query(
    'UPDATE orders SET order_status = ?, updated_at = NOW() WHERE order_id = ?',
    [status, orderId]
  );

  // Add tracking entry if notes provided
  if (notes) {
    await db.query(
      'INSERT INTO order_tracking (order_id, status, notes, created_by) VALUES (?, ?, ?, ?)',
      [orderId, status, notes, req.user.id]
    );
  }

  res.json({ 
    success: true, 
    message: 'Order status updated successfully' 
  });
});

// @desc    Get single order details
// @route   GET /api/admin/orders/:orderId
exports.getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const [orders] = await db.query(`
    SELECT 
      o.*,
      u.full_name as customer_name,
      u.email as customer_email,
      u.phone as customer_phone,
      ua.address_line1,
      ua.address_line2,
      ua.landmark,
      ua.city,
      ua.state,
      ua.postal_code,
      ua.phone as shipping_phone
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    LEFT JOIN user_addresses ua ON o.shipping_address_id = ua.address_id
    WHERE o.order_id = ?
  `, [orderId]);

  if (orders.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  const order = orders[0];

  // Get order items
  const [items] = await db.query(`
    SELECT 
      oi.*,
      p.product_name,
      p.sku,
      pi.image_url
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.product_id
    LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
    WHERE oi.order_id = ?
  `, [orderId]);

  order.items = items;

  res.json({
    success: true,
    order: order
  });
});

// @desc    Delete order
// @route   DELETE /api/admin/orders/:orderId
exports.deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // Check if order exists
  const [orders] = await db.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
  if (orders.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Start transaction
  await db.query('START TRANSACTION');

  try {
    // Delete order items first
    await db.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
    
    // Delete order tracking
    await db.query('DELETE FROM order_tracking WHERE order_id = ?', [orderId]);
    
    // Delete the order
    await db.query('DELETE FROM orders WHERE order_id = ?', [orderId]);

    await db.query('COMMIT');

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order'
    });
  }
});