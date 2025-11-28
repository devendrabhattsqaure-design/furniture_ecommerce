const db = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Mark attendance for a user
// @route   POST /api/attendance/mark
exports.markAttendance = asyncHandler(async (req, res) => {
  const { user_id, attendance_date, status, work_hours, notes } = req.body;

  // Validation
  if (!user_id || !attendance_date || !status) {
    return res.status(400).json({
      success: false,
      message: 'user_id, attendance_date, and status are required'
    });
  }

  // Validate status
  const validStatuses = ['present', 'absent', 'half_day', 'late', 'holiday'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be: present, absent, half_day, late, or holiday'
    });
  }

  // Check if user exists
  const [users] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [user_id]);
  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
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
       SET status = ?, work_hours = ?, notes = ?, marked_by = ?, updated_at = NOW() 
       WHERE attendance_id = ?`,
      [status, finalWorkHours, notes, req.user.id, existing[0].attendance_id]
    );
  } else {
    // Create new attendance record
    await db.query(
      `INSERT INTO attendance (user_id, attendance_date, status, work_hours, notes, marked_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, attendance_date, status, finalWorkHours, notes, req.user.id]
    );
  }

  // Get the updated/created record
  const [attendance] = await db.query(
    `SELECT a.*, u.full_name, u.email, u.role,
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

// @desc    Mark attendance for multiple users
// @route   POST /api/attendance/mark-bulk
exports.markBulkAttendance = asyncHandler(async (req, res) => {
  const { attendance_date, attendances } = req.body;

  if (!attendance_date || !attendances || !Array.isArray(attendances)) {
    return res.status(400).json({
      success: false,
      message: 'attendance_date and attendances array are required'
    });
  }

  const results = {
    success: [],
    errors: []
  };

  for (const att of attendances) {
    try {
      const { user_id, status, work_hours, notes } = att;

      if (!user_id || !status) {
        results.errors.push({
          user_id,
          error: 'user_id and status are required'
        });
        continue;
      }

      // Set default work hours
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
        }
      }

      // Check if attendance exists
      const [existing] = await db.query(
        'SELECT * FROM attendance WHERE user_id = ? AND attendance_date = ?',
        [user_id, attendance_date]
      );

      if (existing.length > 0) {
        await db.query(
          `UPDATE attendance 
           SET status = ?, work_hours = ?, notes = ?, marked_by = ?, updated_at = NOW() 
           WHERE attendance_id = ?`,
          [status, finalWorkHours, notes, req.user.id, existing[0].attendance_id]
        );
      } else {
        await db.query(
          `INSERT INTO attendance (user_id, attendance_date, status, work_hours, notes, marked_by) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [user_id, attendance_date, status, finalWorkHours, notes, req.user.id]
        );
      }

      results.success.push({
        user_id,
        status,
        message: 'Attendance marked successfully'
      });

    } catch (error) {
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

// @desc    Get my attendance
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
    total_hours: attendance.reduce((sum, a) => sum + parseFloat(a.work_hours || 0), 0)
  };

  res.json({
    success: true,
    count: attendance.length,
    summary,
    attendance
  });
});

// @desc    Get all attendance (Admin/Manager)
// @route   GET /api/attendance
exports.getAllAttendance = asyncHandler(async (req, res) => {
  const { user_id, month, year, start_date, end_date, status, page = 1, limit = 20 } = req.query;
  
  let query = `
    SELECT a.*, u.full_name, u.email, u.role,
           marker.full_name as marked_by_name
    FROM attendance a 
    JOIN users u ON a.user_id = u.user_id 
    LEFT JOIN users marker ON a.marked_by = marker.user_id
    WHERE 1=1
  `;
  const params = [];

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

// @desc    Get attendance summary
// @route   GET /api/attendance/summary
exports.getAttendanceSummary = asyncHandler(async (req, res) => {
  const { user_id, month, year, start_date, end_date } = req.query;
  
  let query = `
    SELECT 
      COUNT(*) as total_days,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
      SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
      SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
      SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as half_days,
      SUM(CASE WHEN status = 'holiday' THEN 1 ELSE 0 END) as holiday_days,
      AVG(work_hours) as avg_hours_per_day,
      SUM(work_hours) as total_hours
    FROM attendance 
    WHERE 1=1
  `;
  const params = [];

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

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
exports.deleteAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;

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

// @desc    Get users for attendance marking
// @route   GET /api/attendance/users
exports.getUsersForAttendance = asyncHandler(async (req, res) => {
  const { date } = req.query;
  
  const [users] = await db.query(
    `SELECT user_id, email, full_name, phone, role, status 
     FROM users 
     WHERE status = 'active' AND role IN ('customer', 'manager', 'admin')
     ORDER BY full_name ASC`
  );

  // If date provided, include attendance status for that date
  if (date) {
    for (let user of users) {
      const [attendance] = await db.query(
        'SELECT status, work_hours, notes FROM attendance WHERE user_id = ? AND attendance_date = ?',
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

// @desc    Mark attendance for a user with salary calculation
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

  // Check if user exists and get base salary
  const [users] = await db.query('SELECT user_id, base_salary FROM users WHERE user_id = ?', [user_id]);
  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = users[0];
  const baseSalary = user.base_salary || 0;

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

  // Calculate daily salary and incentive
  const dailySalary = baseSalary / 30; // Assuming 30 days month
  let incentiveAmount = 0;
  let incentivePercentage = 0;

  // Calculate incentive based on sales
  if (sales_amount && sales_amount > 0) {
    if (sales_amount > 10000) {
      incentivePercentage = 2.0;
      incentiveAmount = (sales_amount * incentivePercentage) / 100;
    }
  }

  let totalSalary = 0;
  if (status === 'present' || status === 'late') {
    totalSalary = dailySalary + incentiveAmount;
  } else if (status === 'half_day') {
    totalSalary = (dailySalary / 2) + incentiveAmount;
  } else {
    totalSalary = incentiveAmount; // Only incentive for absent/holiday if they made sales
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
           base_salary = ?, sales_amount = ?, incentive_percentage = ?, 
           incentive_amount = ?, total_salary = ?, updated_at = NOW() 
       WHERE attendance_id = ?`,
      [status, finalWorkHours, notes, req.user.id, baseSalary, sales_amount || 0, 
       incentivePercentage, incentiveAmount, totalSalary, existing[0].attendance_id]
    );
  } else {
    // Create new attendance record
    await db.query(
      `INSERT INTO attendance (user_id, attendance_date, status, work_hours, notes, marked_by,
       base_salary, sales_amount, incentive_percentage, incentive_amount, total_salary) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, attendance_date, status, finalWorkHours, notes, req.user.id,
       baseSalary, sales_amount || 0, incentivePercentage, incentiveAmount, totalSalary]
    );
  }

  // Get the updated/created record
  const [attendance] = await db.query(
    `SELECT a.*, u.full_name, u.email, u.role,
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

// @desc    Calculate monthly salary for a user
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

  // Get user base salary
  const [users] = await db.query('SELECT base_salary FROM users WHERE user_id = ?', [user_id]);
  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const baseSalary = users[0].base_salary || 0;

  // Get attendance for the month
  const [attendance] = await db.query(
    `SELECT * FROM attendance 
     WHERE user_id = ? AND MONTH(attendance_date) = ? AND YEAR(attendance_date) = ? 
     ORDER BY attendance_date`,
    [user_id, month, year]
  );

  // Calculate salary breakdown
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalHalfDays = 0;
  let totalLate = 0;
  let totalHolidays = 0;
  let totalSales = 0;
  let totalIncentive = 0;
  let totalSalary = 0;

  const dailySalary = baseSalary / 30;
  const workingDays = attendance.filter(a => 
    a.status === 'present' || a.status === 'late' || a.status === 'half_day'
  ).length;

  attendance.forEach(record => {
    switch (record.status) {
      case 'present':
        totalPresent++;
        break;
      case 'absent':
        totalAbsent++;
        break;
      case 'half_day':
        totalHalfDays++;
        break;
      case 'late':
        totalLate++;
        break;
      case 'holiday':
        totalHolidays++;
        break;
    }

    totalSales += parseFloat(record.sales_amount || 0);
    totalIncentive += parseFloat(record.incentive_amount || 0);
    totalSalary += parseFloat(record.total_salary || 0);
  });

  // Apply absent deduction rules (1 absent free, then deduct)
  let absentDeduction = 0;
  if (totalAbsent > 1) {
    absentDeduction = (totalAbsent - 1) * dailySalary;
  }

  const finalSalary = totalSalary - absentDeduction;

  const salaryBreakdown = {
    baseSalary,
    totalPresent,
    totalAbsent,
    totalHalfDays,
    totalLate,
    totalHolidays,
    workingDays,
    totalSales,
    totalIncentive,
    dailySalary: dailySalary.toFixed(2),
    absentDeduction,
    totalEarned: totalSalary,
    finalSalary: finalSalary > 0 ? finalSalary : 0
  };

  res.json({
    success: true,
    salaryBreakdown,
    attendance
  });
});

// @desc    Set user base salary
// @route   PUT /api/users/:id/salary
exports.setUserSalary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { base_salary } = req.body;

  if (!base_salary || base_salary < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid base salary is required'
    });
  }

  // Check if user exists
  const [existingUsers] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
  if (existingUsers.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  await db.query(
    'UPDATE users SET base_salary = ?, updated_at = NOW() WHERE user_id = ?',
    [base_salary, id]
  );

  res.json({
    success: true,
    message: 'Base salary updated successfully'
  });
});

// @desc    Get user attendance with salary for specific month
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

  // Get user details
  const [users] = await db.query(
    'SELECT user_id, full_name, email, role, base_salary FROM users WHERE user_id = ?',
    [user_id]
  );

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = users[0];

  // Get attendance for the specific month
  const [attendance] = await db.query(
    `SELECT * FROM attendance 
     WHERE user_id = ? AND MONTH(attendance_date) = ? AND YEAR(attendance_date) = ? 
     ORDER BY attendance_date`,
    [user_id, month, year]
  );

  // Calculate salary summary
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalHalfDays = 0;
  let totalLate = 0;
  let totalSales = 0;
  let totalIncentive = 0;
  let totalEarned = 0;

  attendance.forEach(record => {
    switch (record.status) {
      case 'present': totalPresent++; break;
      case 'absent': totalAbsent++; break;
      case 'half_day': totalHalfDays++; break;
      case 'late': totalLate++; break;
    }
    totalSales += parseFloat(record.sales_amount || 0);
    totalIncentive += parseFloat(record.incentive_amount || 0);
    totalEarned += parseFloat(record.total_salary || 0);
  });

  // Calculate final salary with absent deduction
  const dailySalary = user.base_salary / 30;
  let absentDeduction = 0;
  if (totalAbsent > 1) {
    absentDeduction = (totalAbsent - 1) * dailySalary;
  }

  const finalSalary = totalEarned - absentDeduction;

  const salarySummary = {
    baseSalary: user.base_salary,
    totalPresent,
    totalAbsent,
    totalHalfDays,
    totalLate,
    totalWorkingDays: totalPresent + totalHalfDays + totalLate,
    totalSales,
    totalIncentive,
    dailySalary: dailySalary.toFixed(2),
    absentDeduction,
    totalEarned,
    finalSalary: finalSalary > 0 ? finalSalary : 0
  };

  res.json({
    success: true,
    user,
    attendance,
    salarySummary
  });
});