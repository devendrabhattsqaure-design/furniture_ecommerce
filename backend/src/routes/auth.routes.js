// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  registerAdmin
} = require('../controllers/auth.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { uploadProfile } = require('../config/cloudinary'); // Add this import

const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').notEmpty().withMessage('Full name is required')
];

const adminRegisterValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('role').isIn(['customer', 'admin', 'manager', 'employee']).withMessage('Invalid role')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Add uploadProfile middleware for admin register
router.post('/admin/register', protect, authorize('admin'), uploadProfile.single('image'), adminRegisterValidation, registerAdmin);

module.exports = router;