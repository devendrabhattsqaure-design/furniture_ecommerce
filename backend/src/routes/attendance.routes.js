const express = require('express');
const router = express.Router();
const {
  markAttendance,
  markBulkAttendance,
  getMyAttendance,
  getAllAttendance,
  getAttendanceSummary,
  deleteAttendance,
  getUsersForAttendance,
  calculateMonthlySalary,        // Add this
  getUserAttendanceWithSalary    // Add this
} = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// User routes
router.get('/my-attendance', protect, getMyAttendance);

// Admin/Manager routes
router.get('/', protect, authorize('admin', 'manager'), getAllAttendance);
router.get('/summary', protect, authorize('admin', 'manager'), getAttendanceSummary);
router.get('/users', protect, authorize('admin', 'manager'), getUsersForAttendance);
router.post('/mark', protect, authorize('admin', 'manager'), markAttendance);
router.post('/mark-bulk', protect, authorize('admin', 'manager'), markBulkAttendance);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteAttendance);

// New salary routes
router.get('/salary/:user_id', protect, authorize('admin', 'manager'), calculateMonthlySalary);
router.get('/user/:user_id', protect, authorize('admin', 'manager'), getUserAttendanceWithSalary);

module.exports = router;