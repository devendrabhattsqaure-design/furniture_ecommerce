// controllers/cart.controller.js
const db = require('../config/database');
const asyncHandler = require('express-async-handler');

// Helper function to get or create cart
const getOrCreateCart = async (userId) => {
  let [carts] = await db.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
  
  if (carts.length === 0) {
    const [result] = await db.query(
      'INSERT INTO cart (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())', 
      [userId]
    );
    carts = [{ cart_id: result.insertId, user_id: userId }];
  }
  
  return carts[0];
};

// @desc    Get cart
// @route   GET /api/cart
exports.getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  const cartId = cart.cart_id;

  // Get cart items with product details
  const [items] = await db.query(
    `SELECT 
      ci.cart_item_id,
      ci.product_id,
      ci.quantity,
      ci.price,
      ci.added_at,
      p.product_name,
      p.slug,
      p.sku,
      p.stock_quantity,
      p.is_active,
      pi.image_url
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.product_id
    LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
    WHERE ci.cart_id = ?
    GROUP BY ci.cart_item_id`,
    [cartId]
  );

  // Calculate totals
  const [totalResult] = await db.query(
    'SELECT SUM(quantity * price) as total, SUM(quantity) as totalItems FROM cart_items WHERE cart_id = ?',
    [cartId]
  );

  const cartData = {
    cart_id: cartId,
    items: items || [],
    total: parseFloat(totalResult[0].total) || 0,
    totalItems: parseInt(totalResult[0].totalItems) || 0
  };

  res.json({ 
    success: true, 
    data: cartData 
  });
});

// @desc    Add to cart
// @route   POST /api/cart/add
exports.addToCart = asyncHandler(async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  // Validate input
  if (!product_id) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }

  // Check product exists and is active
  const [products] = await db.query(
    'SELECT * FROM products WHERE product_id = ? AND is_active = TRUE', 
    [product_id]
  );
  
  if (products.length === 0) {
    return res.status(404).json({ success: false, message: 'Product not found or inactive' });
  }

  const product = products[0];
  
  // Check stock availability
  if (product.stock_quantity < quantity) {
    return res.status(400).json({ 
      success: false, 
      message: `Only ${product.stock_quantity} items available in stock` 
    });
  }

  // Get or create cart
  const cart = await getOrCreateCart(req.user.id);
  const cartId = cart.cart_id;

  // Check if item already in cart
  const [existingItems] = await db.query(
    'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cartId, product_id]
  );

  let newQuantity = quantity;
  
  if (existingItems.length > 0) {
    // Update existing item
    newQuantity = existingItems[0].quantity + quantity;
    
    // Check if new quantity exceeds stock
    if (newQuantity > product.stock_quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot add more than available stock. Current in cart: ${existingItems[0].quantity}, Available: ${product.stock_quantity}` 
      });
    }

    await db.query(
      'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE cart_item_id = ?',
      [newQuantity, existingItems[0].cart_item_id]
    );
  } else {
    // Add new item
    await db.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity, price, added_at) VALUES (?, ?, ?, ?, NOW())',
      [cartId, product_id, quantity, product.price]
    );
  }

  // Get updated cart
  const [updatedItems] = await db.query(
    `SELECT 
      ci.cart_item_id,
      ci.product_id,
      ci.quantity,
      ci.price,
      p.product_name,
      p.slug,
      p.stock_quantity,
      pi.image_url
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.product_id
    LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
    WHERE ci.cart_id = ?`,
    [cartId]
  );

  const [totalResult] = await db.query(
    'SELECT SUM(quantity * price) as total, SUM(quantity) as totalItems FROM cart_items WHERE cart_id = ?',
    [cartId]
  );

  res.json({ 
    success: true, 
    message: existingItems.length > 0 ? 'Cart item updated' : 'Product added to cart',
    data: {
      items: updatedItems,
      total: parseFloat(totalResult[0].total) || 0,
      totalItems: parseInt(totalResult[0].totalItems) || 0
    }
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/item/:itemId
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
  }

  // Get cart item with product info
  const [items] = await db.query(
    `SELECT ci.*, p.stock_quantity 
     FROM cart_items ci 
     JOIN products p ON ci.product_id = p.product_id 
     WHERE ci.cart_item_id = ? AND ci.cart_id IN (SELECT cart_id FROM cart WHERE user_id = ?)`,
    [itemId, req.user.id]
  );

  if (items.length === 0) {
    return res.status(404).json({ success: false, message: 'Cart item not found' });
  }

  const item = items[0];

  // Check stock availability
  if (quantity > item.stock_quantity) {
    return res.status(400).json({ 
      success: false, 
      message: `Only ${item.stock_quantity} items available in stock` 
    });
  }

  await db.query(
    'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE cart_item_id = ?',
    [quantity, itemId]
  );

  // Get updated cart totals
  const cart = await getOrCreateCart(req.user.id);
  const [totalResult] = await db.query(
    'SELECT SUM(quantity * price) as total, SUM(quantity) as totalItems FROM cart_items WHERE cart_id = ?',
    [cart.cart_id]
  );

  res.json({ 
    success: true, 
    message: 'Cart updated successfully',
    data: {
      total: parseFloat(totalResult[0].total) || 0,
      totalItems: parseInt(totalResult[0].totalItems) || 0
    }
  });
});

// @desc    Remove from cart
// @route   DELETE /api/cart/item/:itemId
exports.removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const [result] = await db.query(
    'DELETE FROM cart_items WHERE cart_item_id = ? AND cart_id IN (SELECT cart_id FROM cart WHERE user_id = ?)',
    [itemId, req.user.id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: 'Cart item not found' });
  }

  // Get updated cart totals
  const cart = await getOrCreateCart(req.user.id);
  const [totalResult] = await db.query(
    'SELECT SUM(quantity * price) as total, SUM(quantity) as totalItems FROM cart_items WHERE cart_id = ?',
    [cart.cart_id]
  );

  res.json({ 
    success: true, 
    message: 'Item removed from cart',
    data: {
      total: parseFloat(totalResult[0].total) || 0,
      totalItems: parseInt(totalResult[0].totalItems) || 0
    }
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  
  await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.cart_id]);

  res.json({ 
    success: true, 
    message: 'Cart cleared successfully',
    data: {
      items: [],
      total: 0,
      totalItems: 0
    }
  });
});