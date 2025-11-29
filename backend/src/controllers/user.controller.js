// backend/src/controllers/user.controller.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');


// @desc    Create a new user
// @route   POST /api/auth/admin/register
exports.createUser = asyncHandler(async (req, res) => {
  const { 
    full_name, 
    email, 
    phone, 
    role, 
    date_of_birth, 
    gender,
    base_salary,
    target_amount,
    incentive_percentage
  } = req.body;

  // Validation
  if (!full_name || !email || !phone || !role) {
    return res.status(400).json({
      success: false,
      message: 'Full name, email, phone, and role are required'
    });
  }

  // Check if user already exists
  const [existingUsers] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
  if (existingUsers.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Generate default password (name@12345)
  const defaultPassword = `${full_name.split(' ')[0].toLowerCase()}@12345`;
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Calculate incentive amount
  const incentiveAmount = target_amount && incentive_percentage ? 
    (parseFloat(target_amount) * parseFloat(incentive_percentage)) / 100 : 0;

  // Handle profile image
  let profileImage = null;
  if (req.file) {
    profileImage = req.file.path; // Cloudinary URL or file path
  }

  // Insert user with target and incentive
  const [result] = await db.query(
    `INSERT INTO users (full_name, email, password_hash, phone, role, date_of_birth, gender, 
     base_salary, target_amount, incentive_percentage, incentive_amount, profile_image) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      full_name, 
      email, 
      hashedPassword, 
      phone, 
      role, 
      date_of_birth || null, 
      gender || null,
      parseFloat(base_salary) || 0,
      parseFloat(target_amount) || 0,
      parseFloat(incentive_percentage) || 0,
      incentiveAmount,
      profileImage
    ]
  );

  // Get the created user
  const [users] = await db.query(
    `SELECT user_id, email, full_name, phone, role, status, profile_image,
            base_salary, target_amount, incentive_percentage, incentive_amount,
            created_at 
     FROM users WHERE user_id = ?`,
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: users[0],
    defaultPassword: defaultPassword
  });
});
// @desc    Get user profile
// @route   GET /api/users/profile
exports.getProfile = asyncHandler(async (req, res) => {
  const [users] = await db.query(
    'SELECT user_id, email, full_name, phone, date_of_birth, gender, profile_image, role, status, email_verified, created_at, base_salary FROM users WHERE user_id = ?',
    [req.user.id]
  );

  res.json({ success: true, user: users[0] });
});

// @desc    Change password
// @route   PUT /api/users/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const [users] = await db.query('SELECT * FROM users WHERE user_id = ?', [req.user.id]);
  const user = users[0];

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
  const password_hash = await bcrypt.hash(newPassword, salt);

  await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [password_hash, req.user.id]);

  res.json({ success: true, message: 'Password changed successfully' });
});

// @desc    Upload profile image
// @route   POST /api/users/upload-profile-image
exports.uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  await db.query('UPDATE users SET profile_image = ? WHERE user_id = ?', [req.file.path, req.user.id]);

  const [users] = await db.query(
    'SELECT user_id, email, full_name, phone, profile_image, role FROM users WHERE user_id = ?',
    [req.user.id]
  );

  res.json({ success: true, message: 'Profile image updated', user: users[0] });
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const [users] = await db.query(
    'SELECT user_id, email, full_name, phone, role, profile_image, status, email_verified, gender, date_of_birth, created_at, base_salary, target_amount, incentive_percentage, incentive_amount FROM users ORDER BY created_at DESC'
  );

  res.json({ success: true, count: users.length, users });
});

// @desc    Update user
// @route   PUT /api/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    full_name, 
    email, 
    phone, 
    role, 
    status, 
    date_of_birth, 
    gender,
    base_salary,
    target_amount,
    incentive_percentage
  } = req.body;

  // Check if user exists
  const [existingUsers] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
  if (existingUsers.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Calculate incentive amount
  const incentiveAmount = target_amount && incentive_percentage ? 
    (parseFloat(target_amount) * parseFloat(incentive_percentage)) / 100 : 0;

  // Handle profile image upload
  let profileImage = existingUsers[0].profile_image;
  if (req.file) {
    profileImage = req.file.path; // Cloudinary URL or file path
  }

  // Update user
  await db.query(
    `UPDATE users 
     SET full_name = ?, email = ?, phone = ?, role = ?, status = ?, 
         date_of_birth = ?, gender = ?, profile_image = ?, 
         base_salary = ?, target_amount = ?, incentive_percentage = ?, incentive_amount = ?,
         updated_at = NOW() 
     WHERE user_id = ?`,
    [
      full_name, 
      email, 
      phone, 
      role, 
      status,
      date_of_birth || null, 
      gender || null, 
      profileImage,
      parseFloat(base_salary) || 0,
      parseFloat(target_amount) || 0,
      parseFloat(incentive_percentage) || 0,
      incentiveAmount,
      id
    ]
  );

  // Get updated user
  const [users] = await db.query(
    `SELECT user_id, email, full_name, phone, role, status, profile_image,
            base_salary, target_amount, incentive_percentage, incentive_amount,
            created_at, updated_at 
     FROM users WHERE user_id = ?`,
    [id]
  );

  res.json({
    success: true,
    message: 'User updated successfully',
    user: users[0]
  });
});
// @desc    Set user base salary (Admin only)
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

  // Get updated user
  const [users] = await db.query(
    'SELECT user_id, full_name, email, base_salary FROM users WHERE user_id = ?',
    [id]
  );

  res.json({
    success: true,
    message: 'Base salary updated successfully',
    user: users[0]
  });
});

// @desc    Update user profile (for own profile)
// @route   PUT /api/users/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { full_name, phone, date_of_birth, gender } = req.body;

  // Debug logging
  console.log('Profile update data:', req.body);
  console.log('Profile update file:', req.file);

  if (!full_name) {
    return res.status(400).json({
      success: false,
      message: 'Full name is required'
    });
  }

  try {
    // Handle profile image upload
    let profile_image = null;
    if (req.file) {
      profile_image = req.file.path;
    }

    // Build update query dynamically based on provided fields
    let query = 'UPDATE users SET full_name = ?, phone = ?, date_of_birth = ?, gender = ?, updated_at = NOW()';
    let params = [full_name, phone, date_of_birth || null, gender || null];

    if (profile_image) {
      query = query.replace('updated_at = NOW()', 'profile_image = ?, updated_at = NOW()');
      params.splice(4, 0, profile_image);
    }

    query += ' WHERE user_id = ?';
    params.push(req.user.id);

    await db.query(query, params);

    const [users] = await db.query(
      'SELECT user_id, email, full_name, phone, date_of_birth, gender, profile_image, role, status, base_salary FROM users WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ 
      success: true, 
      message: 'Profile updated successfully', 
      user: users[0] 
    });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error occurred'
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({ success: true, message: 'User deleted successfully' });
});
// @desc    Get single user by ID
// @route   GET /api/users/:id
exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [users] = await db.query(
    `SELECT user_id, email, full_name, phone, role, status,date_of_birth, gender, 
            profile_image, base_salary, target_amount, incentive_percentage, incentive_amount,
            created_at, updated_at
     FROM users 
     WHERE user_id = ?`,
    [id]
  );

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    user: users[0]
  });
});