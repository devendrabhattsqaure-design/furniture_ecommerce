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
  setUserSalary ,
   getUserById,
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { uploadProfile } = require('../config/cloudinary');

// User profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/upload-profile-image', protect, uploadProfile.single('image'), uploadProfileImage);

// Admin only routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id', protect, authorize('admin'), uploadProfile.single('image'), updateUser);
router.put('/:id/salary', protect, authorize('admin'), setUserSalary);  // This route should work now
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.get('/:id', protect, authorize('admin', 'manager'), getUserById);

module.exports = router;