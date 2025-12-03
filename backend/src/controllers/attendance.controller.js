const db = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Mark attendance for multiple users with sales amount - WITH ORG CHECK
// @route   POST /api/attendance/mark-bulk
exports.markBulkAttendance = asyncHandler(async (req, res) => {
  const { attendance_date, attendances } = req.body;

  if (!attendance_date || !attendances || !Array.isArray(attendances)) {
    return res.status(400).json({
      success: false,
      message: 'attendance_date and attendances array are required'
    });
  }

  // Get current user's organization
  const [currentUser] = await db.query(
    'SELECT org_id, role FROM users WHERE user_id = ?',
    [req.user.id]
  );

  const currentUserOrgId = currentUser[0]?.org_id;
  const isSuperAdmin = req.user.role === 'super_admin';

  const results = {
    success: [],
    errors: []
  };

  for (const att of attendances) {
    try {
      const { user_id, status, work_hours, notes, sales_amount } = att;

      if (!user_id || !status) {
        results.errors.push({
          user_id,
          error: 'user_id and status are required'
        });
        continue;
      }

      // Check if user exists AND belongs to same organization (unless super admin)
      const [users] = await db.query(
        'SELECT user_id, org_id FROM users WHERE user_id = ?',
        [user_id]
      );
      
      if (users.length === 0) {
        results.errors.push({
          user_id,
          error: 'User not found'
        });
        continue;
      }

      const userOrgId = users[0].org_id;

      // Check organization permission
      if (!isSuperAdmin && userOrgId !== currentUserOrgId) {
        results.errors.push({
          user_id,
          error: 'You can only mark attendance for users in your organization'
        });
        continue;
      }

      // Set default work hours based on status
      let finalWorkHours = work_hours;
      if (!work_hours) {
        switch (status) {
          case 'present': 
            finalWorkHours = 8.00; 
            break;
          case 'half_day': 
            finalWorkHours = 4.00; 
            break;
          case 'absent':
          case 'holiday': 
            finalWorkHours = 0.00; 
            break;
          default: 
            finalWorkHours = 8.00;
        }
      }

      // Check if attendance already exists for this date
      const [existing] = await db.query(
        'SELECT * FROM attendance WHERE user_id = ? AND attendance_date = ?',
        [user_id, attendance_date]
      );

      if (existing.length > 0) {
        // Update existing attendance
        await db.query(
          `UPDATE attendance 
           SET status = ?, work_hours = ?, notes = ?, marked_by = ?, 
               sales_amount = ?, org_id = ?, updated_at = NOW() 
           WHERE attendance_id = ?`,
          [
            status, 
            finalWorkHours, 
            notes, 
            req.user.id, 
            parseFloat(sales_amount) || 0,
            userOrgId,
            existing[0].attendance_id
          ]
        );
      } else {
        // Create new attendance record
        await db.query(
          `INSERT INTO attendance (
            user_id, attendance_date, status, work_hours, notes, marked_by, sales_amount, org_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user_id, 
            attendance_date, 
            status, 
            finalWorkHours, 
            notes, 
            req.user.id,
            parseFloat(sales_amount) || 0,
            userOrgId
          ]
        );
      }

      results.success.push({
        user_id,
        status,
        sales_amount: parseFloat(sales_amount) || 0,
        message: 'Attendance marked successfully'
      });

    } catch (error) {
      console.error('Error marking attendance for user:', att.user_id, error);
      results.errors.push({
        user_id: att.user_id,
        error: error.message
      });
    }
  }

  res.json({
    success: true,
    message: `Bulk attendance completed. Success: ${results.success.length}, Errors: ${results.errors.length}`,
    results
  });
});

// @desc    Mark attendance for a user with sales amount - WITH ORG CHECK
// @route   POST /api/attendance/mark
exports.markAttendance = asyncHandler(async (req, res) => {
  const { user_id, attendance_date, status, work_hours, notes, sales_amount } = req.body;

  // Validation
  if (!user_id || !attendance_date || !status) {
    return res.status(400).json({
      success: false,
      message: 'user_id, attendance_date, and status are required'
    });
  }

  // Get current user's organization
  const [currentUser] = await db.query(
    'SELECT org_id, role FROM users WHERE user_id = ?',
    [req.user.id]
  );

  // Check if user exists
  const [users] = await db.query(
    'SELECT user_id, org_id FROM users WHERE user_id = ?',
    [user_id]
  );
  
  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const userOrgId = users[0].org_id;
  const currentUserOrgId = currentUser[0]?.org_id;
  const isSuperAdmin = req.user.role === 'super_admin';

  // Check organization permission
  if (!isSuperAdmin && userOrgId !== currentUserOrgId) {
    return res.status(403).json({
      success: false,
      message: 'You can only mark attendance for users in your organization'
    });
  }

  // Set default work hours based on status
  let finalWorkHours = work_hours;
  if (!work_hours) {
    switch (status) {
      case 'present':
        finalWorkHours = 8.00;
        break;
      case 'half_day':
        finalWorkHours = 4.00;
        break;
      case 'late':
        finalWorkHours = 7.00;
        break;
      case 'absent':
      case 'holiday':
        finalWorkHours = 0.00;
        break;
      default:
        finalWorkHours = 8.00;
    }
  }

  // Check if attendance already exists for this date
  const [existing] = await db.query(
    'SELECT * FROM attendance WHERE user_id = ? AND attendance_date = ?',
    [user_id, attendance_date]
  );

  if (existing.length > 0) {
    // Update existing attendance
    await db.query(
      `UPDATE attendance 
       SET status = ?, work_hours = ?, notes = ?, marked_by = ?, 
           sales_amount = ?, org_id = ?, updated_at = NOW() 
       WHERE attendance_id = ?`,
      [status, finalWorkHours, notes, req.user.id, parseFloat(sales_amount) || 0, userOrgId, existing[0].attendance_id]
    );
  } else {
    // Create new attendance record
    await db.query(
      `INSERT INTO attendance (user_id, attendance_date, status, work_hours, notes, marked_by, sales_amount, org_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, attendance_date, status, finalWorkHours, notes, req.user.id, parseFloat(sales_amount) || 0, userOrgId]
    );
  }

  // Get the updated/created record
  const [attendance] = await db.query(
    `SELECT a.*, u.full_name, u.email, u.role, u.org_id,
            marker.full_name as marked_by_name
     FROM attendance a 
     JOIN users u ON a.user_id = u.user_id 
     LEFT JOIN users marker ON a.marked_by = marker.user_id
     WHERE a.user_id = ? AND a.attendance_date = ?`,
    [user_id, attendance_date]
  );

  res.json({
    success: true,
    message: `Attendance marked as ${status} successfully`,
    attendance: attendance[0]
  });
});

// @desc    Calculate monthly salary for a user with incentive based on sales - WITH ORG CHECK
// @route   GET /api/attendance/salary/:user_id
exports.calculateMonthlySalary = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({
      success: false,
      message: 'Month and year are required'
    });
  }

  // Get current user's organization
  const [currentUser] = await db.query(
    'SELECT org_id, role FROM users WHERE user_id = ?',
    [req.user.id]
  );

  const currentUserOrgId = currentUser[0]?.org_id;
  const isSuperAdmin = req.user.role === 'super_admin';

  // Get user details including base salary, target and incentive percentage
  const [users] = await db.query(
    'SELECT user_id, full_name, base_salary, target_amount, incentive_percentage, org_id FROM users WHERE user_id = ?', 
    [user_id]
  );
  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = users[0];

  // Check organization permission
  if (!isSuperAdmin && user.org_id !== currentUserOrgId) {
    return res.status(403).json({
      success: false,
      message: 'You can only access salary data for users in your organization'
    });
  }

  const baseSalary = user.base_salary || 0;
  const targetAmount = user.target_amount || 0;
  const incentivePercentage = user.incentive_percentage || 0;

  // Get attendance for the month
  const [attendance] = await db.query(
    `SELECT * FROM attendance 
     WHERE user_id = ? AND MONTH(attendance_date) = ? AND YEAR(attendance_date) = ? 
     ORDER BY attendance_date`,
    [user_id, month, year]
  );

  // Calculate monthly totals
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalHalfDays = 0;
  let totalLate = 0;
  let totalHolidays = 0;
  let totalSales = 0;

  attendance.forEach(record => {
    switch (record.status) {
      case 'present': totalPresent++; break;
      case 'absent': totalAbsent++; break;
      case 'half_day': totalHalfDays++; break;
      case 'late': totalLate++; break;
      case 'holiday': totalHolidays++; break;
    }
    totalSales += parseFloat(record.sales_amount || 0);
  });

  // Calculate incentive based on monthly sales vs target
  let totalIncentive = 0;
  if (targetAmount > 0 && totalSales >= targetAmount) {
    totalIncentive = (totalSales * incentivePercentage) / 100;
  }

  // Calculate final salary (base salary + incentive)
  const finalSalary = baseSalary + totalIncentive;

  const salaryBreakdown = {
    baseSalary,
    targetAmount,
    incentivePercentage,
    totalPresent,
    totalAbsent,
    totalHalfDays,
    totalLate,
    totalHolidays,
    totalSales,
    totalIncentive,
    finalSalary: finalSalary > 0 ? finalSalary : 0
  };

  res.json({
    success: true,
    salaryBreakdown,
    attendance
  });
});

// @desc    Get user attendance with salary calculation for specific month - WITH ORG CHECK
// @route   GET /api/attendance/user/:user_id
exports.getUserAttendanceWithSalary = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({
      success: false,
      message: 'Month and year are required'
    });
  }

  // Get current user's organization
  const [currentUser] = await db.query(
    'SELECT org_id, role FROM users WHERE user_id = ?',
    [req.user.id]
  );

  const currentUserOrgId = currentUser[0]?.org_id;
  const isSuperAdmin = req.user.role === 'super_admin';

  // Get user details
  const [users] = await db.query(
    'SELECT user_id, full_name, email, role, base_salary, target_amount, incentive_percentage, org_id FROM users WHERE user_id = ?',
    [user_id]
  );

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = users[0];

  // Check organization permission
  if (!isSuperAdmin && user.org_id !== currentUserOrgId) {
    return res.status(403).json({
      success: false,
      message: 'You can only access attendance data for users in your organization'
    });
  }

  // Get attendance for the specific month
  const [attendance] = await db.query(
    `SELECT attendance_id, user_id, attendance_date, status, work_hours, notes,
            sales_amount, marked_by, created_at, updated_at, org_id
     FROM attendance 
     WHERE user_id = ? AND MONTH(attendance_date) = ? AND YEAR(attendance_date) = ? 
     ORDER BY attendance_date`,
    [user_id, month, year]
  );

  // Calculate monthly totals
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalHalfDays = 0;
  let totalLate = 0;
  let totalHolidays = 0;
  let totalSales = 0;

  attendance.forEach(record => {
    switch (record.status) {
      case 'present': totalPresent++; break;
      case 'absent': totalAbsent++; break;
      case 'half_day': totalHalfDays++; break;
      case 'late': totalLate++; break;
      case 'holiday': totalHolidays++; break;
    }
    totalSales += parseFloat(record.sales_amount || 0);
  });

  // Calculate attendance deductions based on the policy
  const dailySalary = user.base_salary / 30; // Assuming 30 days month
  
  // Policy: Either 1 free absent OR 2 free half days (2 half days = 1 absent)
  const totalEquivalentAbsents = totalAbsent + (totalHalfDays / 2);
  
  // Free allowance: either 1 absent OR 2 half days (which is 1 equivalent absent)
  const freeEquivalentAbsents = 1;
  
  // Calculate deductible equivalent absents
  let totalDeductibleEquivalentAbsents = Math.max(0, totalEquivalentAbsents - freeEquivalentAbsents);
  
  // Calculate total deduction
  const totalDeduction = totalDeductibleEquivalentAbsents * dailySalary;

  // Calculate incentive based on monthly sales vs target
  let totalIncentive = 0;
  let targetAchieved = false;
  
  if (user.target_amount > 0 && totalSales >= user.target_amount) {
    targetAchieved = true;
    totalIncentive = (totalSales * user.incentive_percentage) / 100;
  }

  // Calculate final salary with deductions
  const baseSalary = parseFloat(user.base_salary) || 0;
  const finalSalary = Math.max(0, baseSalary + totalIncentive - totalDeduction);

  const salarySummary = {
    baseSalary: baseSalary,
    targetAmount: parseFloat(user.target_amount) || 0,
    incentivePercentage: parseFloat(user.incentive_percentage) || 0,
    totalPresent,
    totalAbsent,
    totalHalfDays,
    totalLate,
    totalHolidays,
    totalSales: parseFloat(totalSales.toFixed(2)),
    totalIncentive: parseFloat(totalIncentive.toFixed(2)),
    dailySalary: parseFloat(dailySalary.toFixed(2)),
    totalEquivalentAbsents: parseFloat(totalEquivalentAbsents.toFixed(2)),
    freeEquivalentAbsents: freeEquivalentAbsents,
    totalDeductibleEquivalentAbsents: parseFloat(totalDeductibleEquivalentAbsents.toFixed(2)),
    totalDeduction: parseFloat(totalDeduction.toFixed(2)),
    finalSalary: parseFloat(finalSalary.toFixed(2)),
    targetAchieved: targetAchieved,
    attendancePolicy: {
      freeAllowance: "1 absent OR 2 half days",
      halfDayConversion: 2
    }
  };

  res.json({
    success: true,
    user,
    attendance,
    salarySummary
  });
});

// @desc    Get my attendance - User's own attendance
// @route   GET /api/attendance/my-attendance
exports.getMyAttendance = asyncHandler(async (req, res) => {
  const { month, year, start_date, end_date, status } = req.query;
  
  let query = `
    SELECT a.*, u.full_name, u.email, u.role,
           marker.full_name as marked_by_name
    FROM attendance a 
    JOIN users u ON a.user_id = u.user_id 
    LEFT JOIN users marker ON a.marked_by = marker.user_id
    WHERE a.user_id = ?
  `;
  const params = [req.user.id];

  if (month && year) {
    query += ' AND MONTH(a.attendance_date) = ? AND YEAR(a.attendance_date) = ?';
    params.push(month, year);
  } else if (start_date && end_date) {
    query += ' AND a.attendance_date BETWEEN ? AND ?';
    params.push(start_date, end_date);
  } else {
    // Default to current month
    const currentDate = new Date();
    query += ' AND MONTH(a.attendance_date) = ? AND YEAR(a.attendance_date) = ?';
    params.push(currentDate.getMonth() + 1, currentDate.getFullYear());
  }

  if (status) {
    query += ' AND a.status = ?';
    params.push(status);
  }

  query += ' ORDER BY a.attendance_date DESC';

  const [attendance] = await db.query(query, params);

  // Calculate summary
  const summary = {
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    half_day: attendance.filter(a => a.status === 'half_day').length,
    late: attendance.filter(a => a.status === 'late').length,
    holiday: attendance.filter(a => a.status === 'holiday').length,
    total_days: attendance.length,
    total_hours: attendance.reduce((sum, a) => sum + parseFloat(a.work_hours || 0), 0),
    total_sales: attendance.reduce((sum, a) => sum + parseFloat(a.sales_amount || 0), 0)
  };

  res.json({
    success: true,
    count: attendance.length,
    summary,
    attendance
  });
});

// @desc    Get all attendance (Admin/Manager) - WITH ORG FILTERING
// @route   GET /api/attendance
exports.getAllAttendance = asyncHandler(async (req, res) => {
  const { user_id, month, year, start_date, end_date, status, page = 1, limit = 20 } = req.query;
  
  // Get current user's organization
  const [currentUser] = await db.query(
    'SELECT org_id, role FROM users WHERE user_id = ?',
    [req.user.id]
  );

  const currentUserOrgId = currentUser[0]?.org_id;
  const isSuperAdmin = req.user.role === 'super_admin';

  let query = `
    SELECT a.*, u.full_name, u.email, u.role,
           marker.full_name as marked_by_name
    FROM attendance a 
    JOIN users u ON a.user_id = u.user_id 
    LEFT JOIN users marker ON a.marked_by = marker.user_id
    WHERE 1=1
  `;
  const params = [];

  // Filter by organization if not super admin
  if (!isSuperAdmin && currentUserOrgId) {
    query += ' AND a.org_id = ?';
    params.push(currentUserOrgId);
  }

  if (user_id) {
    query += ' AND a.user_id = ?';
    params.push(user_id);
  }

  if (month && year) {
    query += ' AND MONTH(a.attendance_date) = ? AND YEAR(a.attendance_date) = ?';
    params.push(month, year);
  } else if (start_date && end_date) {
    query += ' AND a.attendance_date BETWEEN ? AND ?';
    params.push(start_date, end_date);
  }

  if (status) {
    query += ' AND a.status = ?';
    params.push(status);
  }

  // Count total records for pagination
  const countQuery = `SELECT COUNT(*) as total FROM (${query}) as count_table`;
  const [countResult] = await db.query(countQuery, params);
  const total = countResult[0].total;

  // Add pagination and sorting
  query += ' ORDER BY a.attendance_date DESC, u.full_name ASC LIMIT ? OFFSET ?';
  const offset = (page - 1) * limit;
  params.push(parseInt(limit), offset);

  const [attendance] = await db.query(query, params);

  res.json({
    success: true,
    count: attendance.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    attendance
  });
});

// @desc    Get attendance summary - WITH ORG FILTERING
// @route   GET /api/attendance/summary
exports.getAttendanceSummary = asyncHandler(async (req, res) => {
  const { user_id, month, year, start_date, end_date } = req.query;
  
  // Get current user's organization
  const [currentUser] = await db.query(
    'SELECT org_id, role FROM users WHERE user_id = ?',
    [req.user.id]
  );

  const currentUserOrgId = currentUser[0]?.org_id;
  const isSuperAdmin = req.user.role === 'super_admin';

  let query = `
    SELECT 
      COUNT(*) as total_days,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
      SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
      SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
      SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as half_days,
      SUM(CASE WHEN status = 'holiday' THEN 1 ELSE 0 END) as holiday_days,
      AVG(work_hours) as avg_hours_per_day,
      SUM(work_hours) as total_hours,
      SUM(sales_amount) as total_sales
    FROM attendance 
    WHERE 1=1
  `;
  const params = [];

  // Filter by organization if not super admin
  if (!isSuperAdmin && currentUserOrgId) {
    query += ' AND org_id = ?';
    params.push(currentUserOrgId);
  }

  if (user_id) {
    query += ' AND user_id = ?';
    params.push(user_id);
  }

  if (month && year) {
    query += ' AND MONTH(attendance_date) = ? AND YEAR(attendance_date) = ?';
    params.push(month, year);
  } else if (start_date && end_date) {
    query += ' AND attendance_date BETWEEN ? AND ?';
    params.push(start_date, end_date);
  } else {
    // Default to current month
    const currentDate = new Date();
    query += ' AND MONTH(attendance_date) = ? AND YEAR(attendance_date) = ?';
    params.push(currentDate.getMonth() + 1, currentDate.getFullYear());
  }

  const [summary] = await db.query(query, params);

  res.json({
    success: true,
    summary: summary[0]
  });
});

// @desc    Delete attendance record - WITH ORG CHECK
// @route   DELETE /api/attendance/:id
exports.deleteAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get current user's organization
  const [currentUser] = await db.query(
    'SELECT org_id, role FROM users WHERE user_id = ?',
    [req.user.id]
  );

  const currentUserOrgId = currentUser[0]?.org_id;
  const isSuperAdmin = req.user.role === 'super_admin';

  // Check attendance record's organization
  const [attendanceRecord] = await db.query(
    'SELECT * FROM attendance WHERE attendance_id = ?',
    [id]
  );

  if (attendanceRecord.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found'
    });
  }

  // Check organization permission
  if (!isSuperAdmin && attendanceRecord[0].org_id !== currentUserOrgId) {
    return res.status(403).json({
      success: false,
      message: 'You can only delete attendance records for your organization'
    });
  }

  const [result] = await db.query('DELETE FROM attendance WHERE attendance_id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found'
    });
  }

  res.json({
    success: true,
    message: 'Attendance record deleted successfully'
  });
});

// @desc    Get users for attendance marking - WITH ORG FILTERING
// @route   GET /api/attendance/users
exports.getUsersForAttendance = asyncHandler(async (req, res) => {
  const { date } = req.query;
  
  // Get current user's organization
  const [currentUser] = await db.query(
    'SELECT org_id, role FROM users WHERE user_id = ?',
    [req.user.id]
  );

  const currentUserOrgId = currentUser[0]?.org_id;
  const isSuperAdmin = req.user.role === 'super_admin';

  let query = `
    SELECT user_id, email, full_name, phone, role, status, base_salary, target_amount, incentive_percentage, org_id
    FROM users 
    WHERE status = 'active' AND role IN ('employee', 'manager', 'admin')
  `;
  
  const params = [];

  // Filter by organization if not super admin
  if (!isSuperAdmin && currentUserOrgId) {
    query += ' AND org_id = ?';
    params.push(currentUserOrgId);
  }

  query += ' ORDER BY full_name ASC';

  const [users] = await db.query(query, params);

  // If date provided, include attendance status for that date
  if (date) {
    for (let user of users) {
      const [attendance] = await db.query(
        'SELECT status, work_hours, notes, sales_amount FROM attendance WHERE user_id = ? AND attendance_date = ?',
        [user.user_id, date]
      );
      
      user.today_attendance = attendance[0] || null;
    }
  }

  res.json({
    success: true,
    count: users.length,
    users
  });
});