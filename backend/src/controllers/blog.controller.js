const db = require('../config/database');
const asyncHandler = require('express-async-handler');
const { deleteImage, extractPublicId } = require('../config/cloudinary');

// @desc    Get all blog posts
// @route   GET /api/blog
// @access  Public
exports.getAllPosts = asyncHandler(async (req, res) => {
  const [posts] = await db.query(`
    SELECT * FROM blog_posts 
    ORDER BY created_at DESC
  `);
  
  res.json({
    success: true,
    data: posts,
    count: posts.length
  });
});

// @desc    Get single blog post
// @route   GET /api/blog/:id
// @access  Public
exports.getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const [posts] = await db.query(`
    SELECT * FROM blog_posts 
    WHERE post_id = ?
  `, [id]);
  
  if (posts.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'Post not found' 
    });
  }
  
  res.json({
    success: true,
    data: posts[0]
  });
});

// @desc    Create new blog post
// @route   POST /api/blog
// @access  Private
exports.createPost = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    content,
    excerpt,
    category,
    tags,
    is_published = false,
    meta_title,
    meta_description
  } = req.body;

  // Get uploaded image URL from Cloudinary
  const featured_image = req.file ? req.file.path : null;

  // Validate required fields
  if (!title || !slug || !content) {
    return res.status(400).json({
      success: false,
      message: 'Title, slug, and content are required'
    });
  }

  // Check if slug already exists
  const [existingSlug] = await db.query(
    'SELECT post_id FROM blog_posts WHERE slug = ?',
    [slug]
  );
  
  if (existingSlug.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Slug already exists'
    });
  }

  // Insert new post
  const [result] = await db.query(
    `INSERT INTO blog_posts (
      title, slug, content, excerpt, featured_image,
      category, tags, is_published, meta_title, meta_description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      slug,
      content,
      excerpt || null,
      featured_image,
      category || null,
      tags ? JSON.stringify(tags) : null,
      is_published,
      meta_title || null,
      meta_description || null
    ]
  );

  // Get the newly created post
  const [newPost] = await db.query(`
    SELECT * FROM blog_posts 
    WHERE post_id = ?
  `, [result.insertId]);

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: newPost[0]
  });
});

// @desc    Update blog post
// @route   PUT /api/blog/:id
// @access  Private
exports.updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if post exists
  const [posts] = await db.query('SELECT * FROM blog_posts WHERE post_id = ?', [id]);
  if (posts.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const existingPost = posts[0];
  const {
    title,
    slug,
    content,
    excerpt,
    category,
    tags,
    is_published,
    meta_title,
    meta_description
  } = req.body;

  // Get uploaded image URL from Cloudinary
  const featured_image = req.file ? req.file.path : existingPost.featured_image;

  // Check if slug already exists for other posts
  if (slug && slug !== existingPost.slug) {
    const [existingSlug] = await db.query(
      'SELECT post_id FROM blog_posts WHERE slug = ? AND post_id != ?',
      [slug, id]
    );
    
    if (existingSlug.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Slug already exists'
      });
    }
  }

  // Delete old image if new image is uploaded
  if (req.file && existingPost.featured_image) {
    try {
      const publicId = extractPublicId(existingPost.featured_image);
      await deleteImage(publicId);
    } catch (error) {
      console.error('Error deleting old image:', error);
    }
  }

  // Update post
  await db.query(
    `UPDATE blog_posts SET 
      title = ?, slug = ?, content = ?, excerpt = ?, featured_image = ?,
      category = ?, tags = ?, is_published = ?,
      meta_title = ?, meta_description = ?, updated_at = NOW()
    WHERE post_id = ?`,
    [
      title || existingPost.title,
      slug || existingPost.slug,
      content || existingPost.content,
      excerpt !== undefined ? excerpt : existingPost.excerpt,
      featured_image,
      category !== undefined ? category : existingPost.category,
      tags !== undefined ? JSON.stringify(tags) : existingPost.tags,
      is_published !== undefined ? is_published : existingPost.is_published,
      meta_title !== undefined ? meta_title : existingPost.meta_title,
      meta_description !== undefined ? meta_description : existingPost.meta_description,
      id
    ]
  );

  // Get updated post
  const [updatedPost] = await db.query(`
    SELECT * FROM blog_posts 
    WHERE post_id = ?
  `, [id]);

  res.json({
    success: true,
    message: 'Post updated successfully',
    data: updatedPost[0]
  });
});

// @desc    Delete blog post
// @route   DELETE /api/blog/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if post exists
  const [posts] = await db.query('SELECT * FROM blog_posts WHERE post_id = ?', [id]);
  if (posts.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const post = posts[0];

  // Delete featured image from Cloudinary if exists
  if (post.featured_image) {
    try {
      const publicId = extractPublicId(post.featured_image);
      await deleteImage(publicId);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  // Delete post
  await db.query('DELETE FROM blog_posts WHERE post_id = ?', [id]);

  res.json({
    success: true,
    message: 'Post deleted successfully'
  });
});

// @desc    Toggle post publish status
// @route   PATCH /api/blog/:id/publish
// @access  Private
exports.togglePublish = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [posts] = await db.query('SELECT * FROM blog_posts WHERE post_id = ?', [id]);
  if (posts.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const currentStatus = posts[0].is_published;
  const newStatus = !currentStatus;

  await db.query(
    'UPDATE blog_posts SET is_published = ?, published_at = ? WHERE post_id = ?',
    [newStatus, newStatus ? new Date() : null, id]
  );

  res.json({
    success: true,
    message: `Post ${newStatus ? 'published' : 'unpublished'} successfully`,
    data: { is_published: newStatus }
  });
});

// @desc    Upload featured image
// @route   POST /api/blog/:id/upload-image
// @access  Private
exports.uploadFeaturedImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided'
    });
  }

  const [posts] = await db.query('SELECT * FROM blog_posts WHERE post_id = ?', [id]);
  if (posts.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const post = posts[0];
  const newImageUrl = req.file.path;

  // Delete old image if exists
  if (post.featured_image) {
    try {
      const publicId = extractPublicId(post.featured_image);
      await deleteImage(publicId);
    } catch (error) {
      console.error('Error deleting old image:', error);
    }
  }

  // Update post with new image
  await db.query(
    'UPDATE blog_posts SET featured_image = ?, updated_at = NOW() WHERE post_id = ?',
    [newImageUrl, id]
  );

  res.json({
    success: true,
    message: 'Image uploaded successfully',
    data: { featured_image: newImageUrl }
  });
});