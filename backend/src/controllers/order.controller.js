const db = require('../config/database');
const asyncHandler = require('express-async-handler');

// Generate order number
const generateOrderNumber = () => {
  const prefix = 'ORD';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// @desc    Create order
// @route   POST /api/orders
exports.createOrder = asyncHandler(async (req, res) => {
  const { payment_method, shipping_address_id, billing_address_id, customer_notes } = req.body;

  // Get cart
  const [carts] = await db.query('SELECT * FROM cart WHERE user_id = ?', [req.user.id]);
  if (carts.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  const cartId = carts[0].cart_id;

  // Get cart items
  const [cartItems] = await db.query(
    `SELECT ci.*, p.product_name, p.sku, p.stock_quantity
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.product_id
     WHERE ci.cart_id = ?`,
    [cartId]
  );

  if (cartItems.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax_amount = subtotal * 0.18;
  const shipping_amount = subtotal >= 5000 ? 0 : 100;
  const total_amount = subtotal + tax_amount + shipping_amount;

  const order_number = generateOrderNumber();

  // Start transaction
  await db.query('START TRANSACTION');

  try {
    // Create order
    const [orderResult] = await db.query(
      `INSERT INTO orders (order_number, user_id, order_status, payment_method, 
       subtotal, discount_amount, tax_amount, shipping_amount, total_amount,
       shipping_address_id, billing_address_id, customer_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_number, req.user.id, 'pending', payment_method, subtotal, 0,
       tax_amount, shipping_amount, total_amount, shipping_address_id,
       billing_address_id, customer_notes]
    );

    const orderId = orderResult.insertId;

    // Add order items and update stock
    for (const item of cartItems) {
      // Check stock
      if (item.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product_name}`);
      }

      // Add order item
      await db.query(
        `INSERT INTO order_items (order_id, product_id, product_name, sku, quantity, 
         unit_price, discount_amount, tax_amount, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.sku, item.quantity,
         item.price, 0, item.price * item.quantity * 0.18, item.price * item.quantity]
      );

      // Update product stock
      await db.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    // Commit transaction
    await db.query('COMMIT');

    // Get created order
    const [orders] = await db.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);

    res.status(201).json({ success: true, message: 'Order created successfully', data: orders[0] });
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
});

// @desc    Get my orders
// @route   GET /api/orders/my-orders
exports.getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM orders WHERE user_id = ?';
  const params = [req.user.id];

  if (status) {
    query += ' AND order_status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [orders] = await db.query(query, params);

  // Get total count
  const [countResult] = await db.query(
    'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
    [req.user.id]
  );
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

// @desc    Get single order
// @route   GET /api/orders/:orderId
exports.getOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const [orders] = await db.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
  if (orders.length === 0) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const order = orders[0];

  // Check authorization
  if (order.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Get order items
  const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

  res.json({ success: true, data: { ...order, items } });
});

// @desc    Cancel order
// @route   PUT /api/orders/:orderId/cancel
exports.cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const [orders] = await db.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
  if (orders.length === 0) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const order = orders[0];

  // Check authorization
  if (order.user_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Check if can be cancelled
  if (!['pending', 'confirmed'].includes(order.order_status)) {
    return res.status(400).json({ success: false, message: 'Order cannot be cancelled' });
  }

  await db.query(
    'UPDATE orders SET order_status = ?, cancelled_at = NOW() WHERE order_id = ?',
    ['cancelled', orderId]
  );

  // Add tracking entry
  await db.query(
    'INSERT INTO order_tracking (order_id, status, notes) VALUES (?, ?, ?)',
    [orderId, 'cancelled', 'Cancelled by customer']
  );

  res.json({ success: true, message: 'Order cancelled successfully' });
});