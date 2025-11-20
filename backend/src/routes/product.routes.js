// In your product routes file
const express = require('express');
const router = express.Router();
const {
  getAllProducts, getProduct, createProduct, updateProduct, 
  deleteProduct, uploadProductImages
} = require('../controllers/product.controller');

const { uploadProduct } = require('../config/cloudinary');

router.get('/', getAllProducts);
router.get('/:id', getProduct);
router.post('/', uploadProduct.array('images', 5), createProduct);
router.put('/:id', uploadProduct.array('images', 5), updateProduct); // Add upload middleware here
router.delete('/:id', deleteProduct);
router.post('/:id/images', uploadProduct.array('images', 5), uploadProductImages);

module.exports = router;