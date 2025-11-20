const db = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Get cart
// @route   GET /api/cart
exports.getCart = asyncHandler(async (req, res) => {
  // Find or create cart
  let [carts] = await db.query('SELECT * FROM cart WHERE user_id = ?', [req.user.id]);

  if (carts.length === 0) {
    const [result] = await db.query('INSERT INTO cart (user_id) VALUES (?)', [req.user.id]);
    carts = [{ cart_id: result.insertId }];
  }

  const cartId = carts[0].cart_id;

  // Get cart items
  const [items] = await db.query(
    `SELECT ci.*, p.product_name, p.slug, p.sku, p.stock_quantity,
     (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = TRUE LIMIT 1) as image_url
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.product_id
     WHERE ci.cart_id = ?`,
    [cartId]
  );

  // Calculate total
  const [totalResult] = await db.query(
    'SELECT SUM(quantity * price) as total FROM cart_items WHERE cart_id = ?',
    [cartId]
  );
  const total = totalResult[0].total || 0;

  res.json({ success: true, data: { items, total } });
});

// @desc    Add to cart
// @route   POST /api/cart/add
exports.addToCart = asyncHandler(async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  // Check product exists and has stock
  const [products] = await db.query('SELECT * FROM products WHERE product_id = ?', [product_id]);
  if (products.length === 0) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const product = products[0];
  if (product.stock_quantity < quantity) {
    return res.status(400).json({ success: false, message: 'Insufficient stock' });
  }

  // Get or create cart
  let [carts] = await db.query('SELECT * FROM cart WHERE user_id = ?', [req.user.id]);
  if (carts.length === 0) {
    const [result] = await db.query('INSERT INTO cart (user_id) VALUES (?)', [req.user.id]);
    carts = [{ cart_id: result.insertId }];
  }

  const cartId = carts[0].cart_id;

  // Check if item already in cart
  const [existing] = await db.query(
    'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cartId, product_id]
  );

  if (existing.length > 0) {
    await db.query(
      'UPDATE cart_items SET quantity = quantity + ?, updated_at = NOW() WHERE cart_item_id = ?',
      [quantity, existing[0].cart_item_id]
    );
  } else {
    await db.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [cartId, product_id, quantity, product.price]
    );
  }

  // Get updated cart
  const [items] = await db.query(
    `SELECT ci.*, p.product_name, p.slug, p.sku
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.product_id
     WHERE ci.cart_id = ?`,
    [cartId]
  );

  const [totalResult] = await db.query(
    'SELECT SUM(quantity * price) as total FROM cart_items WHERE cart_id = ?',
    [cartId]
  );
  const total = totalResult[0].total || 0;

  res.json({ success: true, message: 'Product added to cart', data: { items, total } });
});

// @desc    Update cart item
// @route   PUT /api/cart/item/:itemId
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  await db.query(
    'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE cart_item_id = ?',
    [quantity, itemId]
  );

  res.json({ success: true, message: 'Cart updated successfully' });
});

// @desc    Remove from cart
// @route   DELETE /api/cart/item/:itemId
exports.removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  await db.query('DELETE FROM cart_items WHERE cart_item_id = ?', [itemId]);

  res.json({ success: true, message: 'Item removed from cart' });
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
exports.clearCart = asyncHandler(async (req, res) => {
  const [carts] = await db.query('SELECT * FROM cart WHERE user_id = ?', [req.user.id]);

  if (carts.length > 0) {
    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].cart_id]);
  }

  res.json({ success: true, message: 'Cart cleared successfully' });
});