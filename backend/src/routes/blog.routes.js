const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  togglePublish,
  uploadFeaturedImage
} = require('../controllers/blog.controller');
const { uploadBlog } = require('../config/cloudinary');

// Public routes
router.get('/', getAllPosts);
router.get('/:id', getPostById);

// Protected routes with image upload
router.post('/', uploadBlog.single('featured_image'), createPost);
router.put('/:id', uploadBlog.single('featured_image'), updatePost);
router.delete('/:id', deletePost);
router.patch('/:id/publish', togglePublish);
router.post('/:id/upload-image', uploadBlog.single('featured_image'), uploadFeaturedImage);

module.exports = router;