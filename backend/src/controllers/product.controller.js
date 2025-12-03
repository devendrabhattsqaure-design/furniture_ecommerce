const db = require('../config/database');
const asyncHandler = require('express-async-handler');



// Add this to your product.controller.js
exports.uploadProductImages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [products] = await db.query('SELECT * FROM products WHERE product_id = ?', [id]);
  if (products.length === 0) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No images provided' });
  }

  // Upload new images
  for (let i = 0; i < req.files.length; i++) {
    await db.query(
      'INSERT INTO product_images (product_id, image_url, display_order, is_primary) VALUES (?, ?, ?, ?)',
      [id, req.files[i].path, i, i === 0]
    );
  }

  // Get updated product with images
  const [updatedProducts] = await db.query('SELECT * FROM products WHERE product_id = ?', [id]);
  const [images] = await db.query(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order',
    [id]
  );

  res.json({
    success: true,
    message: 'Images uploaded successfully',
    data: {
      ...updatedProducts[0],
      images
    }
  });
});
// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [products] = await db.query(`
    SELECT p.*, c.category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.category_id 
    WHERE p.product_id = ?
  `, [id]);
  
  if (products.length === 0) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const [images] = await db.query(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order',
    [id]
  );

  res.json({ 
    success: true, 
    data: { 
      ...products[0], 
      images 
    } 
  });
});

exports.getAllProducts = asyncHandler(async (req, res) => {
  const orgId = req.user?.org_id || req.headers['x-org-id'];
  const { page = 1, limit = 100, category_id, search, min_price, max_price, is_featured } = req.query;
  const offset = (page - 1) * limit;

  if (!orgId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Organization ID is required' 
    });
  }

  let query = `
    SELECT p.*, c.category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.category_id 
    WHERE p.org_id = ? AND c.org_id = ?
  `;
  const params = [orgId, orgId];

  if (category_id) {
    query += ' AND p.category_id = ?';
    params.push(category_id);
  }
  if (search) {
    query += ' AND (p.product_name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (min_price) {
    query += ' AND p.price >= ?';
    params.push(min_price);
  }
  if (max_price) {
    query += ' AND p.price <= ?';
    params.push(max_price);
  }
  if (is_featured) {
    query += ' AND p.is_featured = TRUE';
  }

  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [products] = await db.query(query, params);

  // Get images for each product
  for (let product of products) {
    const [images] = await db.query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order',
      [product.product_id]
    );
    product.images = images;
  }

  // Get total count with organization filter
  let countQuery = 'SELECT COUNT(*) as total FROM products WHERE org_id = ?';
  const countParams = [orgId];
  
  if (category_id) {
    countQuery += ' AND category_id = ?';
    countParams.push(category_id);
  }
  
  const [countResult] = await db.query(countQuery, countParams);
  const total = countResult[0].total;

  res.json({
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});


// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user?.org_id || req.headers['x-org-id'];

  if (!orgId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Organization ID is required' 
    });
  }

  const [products] = await db.query(
    'SELECT * FROM products WHERE product_id = ? AND org_id = ?', 
    [id, orgId]
  );
  
  if (products.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'Product not found in your organization' 
    });
  }

  const existingProduct = products[0];
  
  // Check if the request contains form data or JSON
  let updateData;
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    // Handle form data - convert checkbox values from strings to booleans
    updateData = { ...req.body };
    
    // Convert checkbox fields from string to boolean
    const checkboxFields = [
      'is_featured', 'is_bestseller', 'is_new_arrival', 
      'is_on_sale', 'is_active'
    ];
    
    checkboxFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateData[field] = updateData[field] === 'true' || updateData[field] === true;
      } else {
        // If checkbox field is not provided, keep the existing value
        updateData[field] = existingProduct[field];
      }
    });
    
    // Convert numeric fields from string to number
    const numericFields = [
      'price', 'compare_price', 'cost_price', 'stock_quantity', 
      'low_stock_threshold', 'weight'
    ];
    
    numericFields.forEach(field => {
      if (updateData[field] !== undefined && updateData[field] !== '') {
        updateData[field] = parseFloat(updateData[field]);
      } else if (updateData[field] === '') {
        // If empty string, set to null or keep existing
        updateData[field] = existingProduct[field];
      }
    });
    
  } else {
    // Handle JSON data - merge with existing product to preserve missing fields
    updateData = {
      ...existingProduct, // Start with existing values
      ...req.body,       // Override with new values
      product_id: existingProduct.product_id, // Ensure ID doesn't change
      created_at: existingProduct.created_at  // Preserve creation date
    };
  }

  const {
    product_name, slug, sku, category_id, brand, description,
    short_description, price, compare_price, cost_price, material,
    color, dimensions, weight, stock_quantity, low_stock_threshold,
    is_featured, is_bestseller, is_new_arrival, is_on_sale, is_active
  } = updateData;

  console.log('Update data received:', {
    product_name, is_featured, is_bestseller, is_new_arrival, 
    is_on_sale, is_active, category_id
  });

  // Check if SKU already exists for other products
  if (sku !== existingProduct.sku) {
    const [existingSku] = await db.query('SELECT product_id FROM products WHERE sku = ? AND product_id != ?', [sku, id]);
    if (existingSku.length > 0) {
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }
  }

  await db.query(
    `UPDATE products SET 
      product_name = ?, slug = ?, sku = ?, category_id = ?, brand = ?, 
      description = ?, short_description = ?, price = ?, compare_price = ?, 
      cost_price = ?, material = ?, color = ?, dimensions = ?, weight = ?, 
      stock_quantity = ?, low_stock_threshold = ?, is_featured = ?, 
      is_bestseller = ?, is_new_arrival = ?, is_on_sale = ?, is_active = ?,
      updated_at = NOW()
    WHERE product_id = ?`,
    [
      product_name, slug, sku, category_id, brand, description,
      short_description, price, compare_price, cost_price, material,
      color, dimensions, weight, stock_quantity, low_stock_threshold,
      is_featured,
      is_bestseller,
      is_new_arrival,
      is_on_sale,
      is_active,
      id
    ]
  );

  // Handle image uploads if new images are provided
  if (req.files && req.files.length > 0) {
    // Upload new images
    for (let i = 0; i < req.files.length; i++) {
      await db.query(
        'INSERT INTO product_images (product_id, image_url, display_order, is_primary) VALUES (?, ?, ?, ?)',
        [id, req.files[i].path, i, i === 0]
      );
    }
  }

  // Get the updated product with category name and images
  const [updatedProducts] = await db.query(`
    SELECT p.*, c.category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.category_id 
    WHERE p.product_id = ?
  `, [id]);
  
  const [images] = await db.query(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order',
    [id]
  );

  const updatedProduct = {
    ...updatedProducts[0],
    images
  };

  console.log('Product updated successfully:', {
    id: updatedProduct.product_id,
    name: updatedProduct.product_name,
    featured: updatedProduct.is_featured,
    bestseller: updatedProduct.is_bestseller,
    new_arrival: updatedProduct.is_new_arrival,
    on_sale: updatedProduct.is_on_sale,
    active: updatedProduct.is_active
  });

  res.json({ 
    success: true, 
    message: 'Product updated successfully', 
    data: updatedProduct 
  });
});

// @desc    Create product for current organization
// @route   POST /api/products
exports.createProduct = asyncHandler(async (req, res) => {
  const orgId = req.user?.org_id || req.headers['x-org-id'];
  
  if (!orgId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Organization ID is required' 
    });
  }

  // Check if the request contains form data or JSON
  let productData;
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    productData = req.body;
  } else {
    productData = req.body;
  }

  const {
    product_name, slug, sku, category_id, brand, description,
    short_description, price, compare_price, cost_price, material,
    color, dimensions, weight, stock_quantity, low_stock_threshold,
    is_featured, is_bestseller, is_new_arrival, is_on_sale
  } = productData;

  // Check if category belongs to same organization
  const [categoryCheck] = await db.query(
    'SELECT category_id FROM categories WHERE category_id = ? AND org_id = ?',
    [category_id, orgId]
  );
  
  if (categoryCheck.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Category does not belong to your organization'
    });
  }

  // Check if SKU already exists in same organization
  const [existingSku] = await db.query(
    'SELECT product_id FROM products WHERE sku = ? AND org_id = ?', 
    [sku, orgId]
  );
  
  if (existingSku.length > 0) {
    return res.status(400).json({ success: false, message: 'SKU already exists in your organization' });
  }

  const [result] = await db.query(
    `INSERT INTO products (
      product_name, slug, sku, category_id, brand, description, 
      short_description, price, compare_price, cost_price, material, 
      color, dimensions, weight, stock_quantity, low_stock_threshold,
      is_featured, is_bestseller, is_new_arrival, is_on_sale, org_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product_name, slug, sku, category_id, brand, description, 
      short_description, price, compare_price, cost_price, material, 
      color, dimensions, weight, stock_quantity, low_stock_threshold,
      is_featured === 'true' || is_featured === true,
      is_bestseller === 'true' || is_bestseller === true,
      is_new_arrival === 'true' || is_new_arrival === true,
      is_on_sale === 'true' || is_on_sale === true,
      orgId
    ]
  );

  const productId = result.insertId;

  // Upload images if provided
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      await db.query(
        'INSERT INTO product_images (product_id, image_url, display_order, is_primary) VALUES (?, ?, ?, ?)',
        [productId, req.files[i].path, i, i === 0]
      );
    }
  }

  // Get the created product with images
  const [products] = await db.query(
    'SELECT * FROM products WHERE product_id = ? AND org_id = ?', 
    [productId, orgId]
  );
  
  const [images] = await db.query(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order',
    [productId]
  );

  res.status(201).json({ 
    success: true, 
    message: 'Product created successfully', 
    data: { 
      ...products[0], 
      images 
    } 
  });
});


// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [products] = await db.query('SELECT * FROM products WHERE product_id = ?', [id]);
  if (products.length === 0) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  await db.query('DELETE FROM products WHERE product_id = ?', [id]);

  res.json({ success: true, message: 'Product deleted successfully' });
});