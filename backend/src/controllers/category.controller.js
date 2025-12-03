const db = require('../config/database');
const asyncHandler = require('express-async-handler');

// Get organization ID from authenticated user (assuming auth middleware sets req.user)
const getOrgId = (req) => {
  return req.user?.org_id || req.headers['x-org-id'] || null;
};

// @desc    Get all categories for current organization
// @route   GET /api/categories
exports.getAllCategories = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  
  if (!orgId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Organization ID is required' 
    });
  }

  const [categories] = await db.query(
    'SELECT * FROM categories WHERE org_id = ? AND is_active = TRUE ORDER BY category_name', 
    [orgId]
  );
  res.json({ success: true, data: categories });
});

// @desc    Get single category for current organization
// @route   GET /api/categories/:slug
exports.getCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const orgId = getOrgId(req);

  if (!orgId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Organization ID is required' 
    });
  }

  const [categories] = await db.query(
    'SELECT * FROM categories WHERE slug = ? AND org_id = ?', 
    [slug, orgId]
  );
  
  if (categories.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'Category not found' 
    });
  }

  res.json({ success: true, data: categories[0] });
});

// @desc    Create category for current organization
// @route   POST /api/categories
exports.createCategory = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  const { category_name, slug, description, is_active, show_in_menu, display_order } = req.body;
  let image_url = null;

  if (!orgId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Organization ID is required' 
    });
  }

  if (req.file) {
    image_url = req.file.path;
  }

  // Validate required fields
  if (!category_name || !slug) {
    return res.status(400).json({ 
      success: false, 
      message: 'Category name and slug are required' 
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO categories 
       (category_name, slug, description, image_url, is_active, show_in_menu, display_order, org_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_name, 
        slug, 
        description || null, 
        image_url,
        is_active ? 1 : 0,
        show_in_menu ? 1 : 0,
        display_order || 0,
        orgId
      ]
    );

    const [categories] = await db.query(
      'SELECT * FROM categories WHERE category_id = ? AND org_id = ?', 
      [result.insertId, orgId]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Category created successfully', 
      data: categories[0] 
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Handle duplicate slug error within same organization
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Category slug already exists in your organization'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Update category for current organization
// @route   PUT /api/categories/:id
exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = getOrgId(req);
  const { category_name, slug, description, is_active, show_in_menu, display_order } = req.body;

  if (!orgId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Organization ID is required' 
    });
  }

  // Validate required fields
  if (!category_name || !slug) {
    return res.status(400).json({ 
      success: false, 
      message: 'Category name and slug are required' 
    });
  }

  // Check if category exists in current organization
  const [existingCategories] = await db.query(
    'SELECT * FROM categories WHERE category_id = ? AND org_id = ?', 
    [id, orgId]
  );
  
  if (existingCategories.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'Category not found in your organization' 
    });
  }

  try {
    let image_url = existingCategories[0].image_url;
    if (req.file) {
      image_url = req.file.path;
    }

    await db.query(
      `UPDATE categories SET 
        category_name = ?, 
        slug = ?, 
        description = ?, 
        image_url = ?,
        is_active = ?,
        show_in_menu = ?,
        display_order = ?,
        updated_at = NOW() 
       WHERE category_id = ? AND org_id = ?`,
      [
        category_name,
        slug,
        description || null,
        image_url,
        is_active ? 1 : 0,
        show_in_menu ? 1 : 0,
        display_order || 0,
        id,
        orgId
      ]
    );

    const [categories] = await db.query(
      'SELECT * FROM categories WHERE category_id = ? AND org_id = ?', 
      [id, orgId]
    );

    res.json({ 
      success: true, 
      message: 'Category updated successfully', 
      data: categories[0] 
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Handle duplicate slug error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Category slug already exists in your organization'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Delete category from current organization
// @route   DELETE /api/categories/:id
exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = getOrgId(req);

  if (!orgId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Organization ID is required' 
    });
  }

  // Check if category exists in current organization
  const [existingCategories] = await db.query(
    'SELECT * FROM categories WHERE category_id = ? AND org_id = ?', 
    [id, orgId]
  );
  
  if (existingCategories.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'Category not found in your organization' 
    });
  }

  await db.query(
    'DELETE FROM categories WHERE category_id = ? AND org_id = ?', 
    [id, orgId]
  );

  res.json({ 
    success: true, 
    message: 'Category deleted successfully' 
  });
});