const express = require('express');
const router = express.Router();
const {
  getProfile, 
  updateProfile, 
  changePassword, 
  uploadProfileImage,
  getAllUsers,
  updateUser,
  deleteUser,
  setUserSalary,
  getUserById,
  getUsersByOrganization  // Add this
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { uploadProfile } = require('../config/cloudinary');

// User profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/upload-profile-image', protect, uploadProfile.single('image'), uploadProfileImage);

// Organization users route
router.get('/organization/:orgId', protect, getUsersByOrganization);

// Admin only routes
router.get('/', protect, authorize('admin', 'manager'), getAllUsers);
router.get('/:id', protect, authorize('admin', 'manager'), getUserById);
router.put('/:id', protect, authorize('admin'), uploadProfile.single('image'), updateUser);
router.put('/:id/salary', protect, authorize('admin'), setUserSalary);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;