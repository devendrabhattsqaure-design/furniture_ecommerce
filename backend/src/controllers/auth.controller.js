// backend/src/controllers/auth.controller.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.user_id);
  
  const userData = {
    user_id: user.user_id,
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    role: user.role,
    status: user.status,
    email_verified: user.email_verified,
    profile_image: user.profile_image,
    created_at: user.created_at,
    org_id: user.org_id,
    org_name: user.org_name,
    org_logo: user.org_logo
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData
  });
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;

  // Find user with organization info
  const [users] = await db.query(
    `SELECT u.*, o.org_name, o.org_logo 
     FROM users u 
     LEFT JOIN organizations o ON u.org_id = o.org_id 
     WHERE u.email = ?`,
    [email]
  );
  
  if (users.length === 0) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }

  const user = users[0];

  // Check if account is active
  if (user.status !== 'active') {
    return res.status(403).json({ 
      success: false, 
      message: 'Account is not active' 
    });
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }

  // Update last login
  await db.query(
    'UPDATE users SET last_login = NOW() WHERE user_id = ?',
    [user.user_id]
  );

  sendTokenResponse(user, 200, res);
});

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const [users] = await db.query(
    `SELECT u.*, o.org_name, o.org_logo 
     FROM users u 
     LEFT JOIN organizations o ON u.org_id = o.org_id 
     WHERE u.user_id = ?`,
    [req.user.id]
  );

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = users[0];
  
  // Remove sensitive information
  delete user.password_hash;
  delete user.reset_token;
  delete user.reset_token_expiry;

  res.json({ 
    success: true, 
    user
  });
});

// In auth.controller.js, add this missing function:

// @desc    Register user
// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const { full_name, email, password, phone } = req.body;

  // Check if user already exists
  const [existingUsers] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
  if (existingUsers.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  const [result] = await db.query(
    `INSERT INTO users (full_name, email, password_hash, phone, role) 
     VALUES (?, ?, ?, ?, 'customer')`,
    [full_name, email, hashedPassword, phone || null]
  );

  // Get the created user
  const [users] = await db.query(
    'SELECT user_id, email, full_name, phone, role, created_at FROM users WHERE user_id = ?',
    [result.insertId]
  );

  sendTokenResponse(users[0], 201, res);
});

// @desc    Create a new admin user (Super Admin only)
// @route   POST /api/auth/admin/register
exports.registerAdmin = asyncHandler(async (req, res) => {
  // Check if user is super admin
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only super admin can create admin users'
    });
  }

  const { 
    full_name, 
    email, 
    phone, 
    role, 
    date_of_birth, 
    gender,
    base_salary,
    target_amount,
    incentive_percentage,
    org_id
  } = req.body;

  // Validation
  if (!full_name || !email || !phone || !role || !org_id) {
    return res.status(400).json({
      success: false,
      message: 'Full name, email, phone, role, and organization are required'
    });
  }

  // Check if organization exists
  const [orgs] = await db.query('SELECT org_id FROM organizations WHERE org_id = ?', [org_id]);
  if (orgs.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Organization not found'
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
    profileImage = req.file.path;
  }

  // Insert user
  const [result] = await db.query(
    `INSERT INTO users (full_name, email, password_hash, phone, role, date_of_birth, gender, 
     base_salary, target_amount, incentive_percentage, incentive_amount, profile_image, org_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      profileImage,
      org_id
    ]
  );

  // Get the created user with organization info
  const [users] = await db.query(
    `SELECT u.*, o.org_name, o.org_logo
     FROM users u
     LEFT JOIN organizations o ON u.org_id = o.org_id
     WHERE u.user_id = ?`,
    [result.insertId]
  );

  // Remove password from response
  delete users[0].password_hash;

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: users[0],
    defaultPassword: defaultPassword
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const [users] = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  
  if (users.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'No user found with this email' 
    });
  }

  // Generate reset token
  const resetToken = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);

  const expiry = new Date(Date.now() + 3600000);
  
  await db.query(
    'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
    [resetToken, expiry, email]
  );

  // TODO: Send email with reset token
  res.json({ 
    success: true, 
    message: 'Password reset email sent', 
    resetToken 
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const [users] = await db.query(
    'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
    [token]
  );

  if (users.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid or expired reset token' 
    });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  await db.query(
    'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = ?',
    [password_hash, users[0].user_id]
  );

  res.json({ 
    success: true, 
    message: 'Password reset successful' 
  });
});