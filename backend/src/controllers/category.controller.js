const db = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Get all categories
// @route   GET /api/categories
// In your categories controller
exports.getAllCategories = asyncHandler(async (req, res) => {
  const [categories] = await db.query('SELECT * FROM categories WHERE is_active = TRUE ORDER BY category_name');
  res.json({ success: true, data: categories });
});

// @desc    Get single category
// @route   GET /api/categories/:slug
exports.getCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const [categories] = await db.query('SELECT * FROM categories WHERE slug = ?', [slug]);
  if (categories.length === 0) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  res.json({ success: true, data: categories[0] });
});

// @desc    Create category
// @route   POST /api/categories
exports.createCategory = asyncHandler(async (req, res) => {
  const { category_name, slug, description, is_active, show_in_menu, display_order } = req.body;
  let image_url = null;

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
       (category_name, slug, description, image_url, is_active, show_in_menu, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        category_name, 
        slug, 
        description || null, 
        image_url,
        is_active ? 1 : 0,
        show_in_menu ? 1 : 0,
        display_order || 0
      ]
    );

    const [categories] = await db.query('SELECT * FROM categories WHERE category_id = ?', [result.insertId]);

    res.status(201).json({ 
      success: true, 
      message: 'Category created successfully', 
      data: categories[0] 
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Handle duplicate slug error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Category slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { category_name, slug, description, is_active, show_in_menu, display_order } = req.body;

  // Validate required fields
  if (!category_name || !slug) {
    return res.status(400).json({ 
      success: false, 
      message: 'Category name and slug are required' 
    });
  }

  // Check if category exists
  const [existingCategories] = await db.query('SELECT * FROM categories WHERE category_id = ?', [id]);
  if (existingCategories.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'Category not found' 
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
       WHERE category_id = ?`,
      [
        category_name,
        slug,
        description || null,
        image_url,
        is_active ? 1 : 0,
        show_in_menu ? 1 : 0,
        display_order || 0,
        id
      ]
    );

    const [categories] = await db.query('SELECT * FROM categories WHERE category_id = ?', [id]);

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
        message: 'Category slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if category exists
  const [existingCategories] = await db.query('SELECT * FROM categories WHERE category_id = ?', [id]);
  if (existingCategories.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'Category not found' 
    });
  }

  await db.query('DELETE FROM categories WHERE category_id = ?', [id]);

  res.json({ 
    success: true, 
    message: 'Category deleted successfully' 
  });
});