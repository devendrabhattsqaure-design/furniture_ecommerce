const db = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [wishlistItems] = await db.query(`
    SELECT 
      w.wishlist_id,
      w.product_id,
      p.product_name,
      p.price,
      p.compare_price,
      p.sku,
      p.stock_quantity,
      p.is_featured,
      p.is_bestseller,
      p.is_new_arrival,
      p.is_on_sale,
      pi.image_url,
      c.category_name
    FROM wishlist w
    INNER JOIN products p ON w.product_id = p.product_id
    LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `, [userId]);

  res.json({
    success: true,
    data: wishlistItems,
    count: wishlistItems.length
  });
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  // Check if product exists
  const [products] = await db.query('SELECT * FROM products WHERE product_id = ?', [productId]);
  if (products.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check if already in wishlist
  const [existingItems] = await db.query(
    'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );

  if (existingItems.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Product already in wishlist'
    });
  }

  // Add to wishlist
  await db.query(
    'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
    [userId, productId]
  );

  res.status(201).json({
    success: true,
    message: 'Product added to wishlist'
  });
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const [result] = await db.query(
    'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in wishlist'
    });
  }

  res.json({
    success: true,
    message: 'Product removed from wishlist'
  });
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
exports.checkWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const [items] = await db.query(
    'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );

  res.json({
    success: true,
    inWishlist: items.length > 0
  });
});