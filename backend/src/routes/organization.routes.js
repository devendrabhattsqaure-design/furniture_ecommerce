// backend/src/routes/organization.routes.js
const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationsForSelect,
  getOrganization
} = require('../controllers/organization.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { uploadLogo } = require('../config/cloudinary');

// All routes require authentication
router.use(protect);

// Super Admin only routes
router.post('/', authorize('super_admin'), uploadLogo.single('logo'), createOrganization);
router.get('/', authorize('super_admin'), getAllOrganizations);
router.delete('/:id', authorize('super_admin'), deleteOrganization);

// Routes accessible to both super_admin and admin (with org restriction)
router.get('/select', getOrganizationsForSelect);
router.get('/:id', authorize('super_admin', 'admin'), getOrganization);
router.put('/:id', authorize('super_admin', 'admin'), uploadLogo.single('logo'), updateOrganization);

module.exports = router;