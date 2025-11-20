const express = require('express');
const router = express.Router();
const {
  getAllCategories, getCategory, createCategory, updateCategory, deleteCategory
} = require('../controllers/category.controller');

const { uploadCategory } = require('../config/cloudinary');



router.get('/', getAllCategories);
router.get('/:slug', getCategory);

// Admin routes - add authentication middleware
router.post('/',  uploadCategory.single('image'), createCategory);
router.put('/:id', uploadCategory.single('image'), updateCategory);
router.delete('/:id',  deleteCategory);

module.exports = router;