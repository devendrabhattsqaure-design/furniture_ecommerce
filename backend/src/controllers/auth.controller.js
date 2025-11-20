const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { sendTokenResponse } = require('../config/jwt');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');




// @desc    Register user by admin (no password required, auto-generate)
// @route   POST /api/auth/admin/register
exports.registerAdmin = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }

  const { email, full_name, phone, date_of_birth, gender, role } = req.body;

  // Debug logging
  console.log('Received data:', { email, full_name, phone, date_of_birth, gender, role });
  console.log('File received:', req.file);

  // Check if user exists
  const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (existingUsers.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email already registered' 
    });
  }

  // Auto-generate password: name@12345
  const generatedPassword = `${full_name.toLowerCase().replace(/\s+/g, '')}@12345`;
  
  // Hash password
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
  const password_hash = await bcrypt.hash(generatedPassword, salt);

  // Handle profile image upload
  let profile_image = null;
  if (req.file) {
    profile_image = req.file.path;
  }

  // Create user
  try {
    const [result] = await db.query(
      'INSERT INTO users (email, password_hash, full_name, phone, date_of_birth, gender, role, profile_image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [email, password_hash, full_name, phone, date_of_birth || null, gender || null, role, profile_image, 'active']
    );

    // Get created user (without password)
    const [users] = await db.query(
      'SELECT user_id, email, full_name, phone, date_of_birth, gender, profile_image, role, status, email_verified, created_at FROM users WHERE user_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: users[0],
      generatedPassword: generatedPassword // Send back for admin reference
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error occurred'
    });
  }
});



// @desc    Register user
// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password, full_name, phone } = req.body;

  // Check if user exists
  const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (existingUsers.length > 0) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // Hash password
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
  const password_hash = await bcrypt.hash(password, salt);

  // Create user
  const [result] = await db.query(
    'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
    [email, password_hash, full_name, phone, 'customer']
  );

  // Get created user
  const [users] = await db.query(
    'SELECT user_id, email, full_name, phone, role, status, email_verified, created_at FROM users WHERE user_id = ?',
    [result.insertId]
  );

  sendTokenResponse(users[0], 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  // Find user
  const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (users.length === 0) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const user = users[0];

  // Check if account is active
  if (user.status !== 'active') {
    return res.status(403).json({ success: false, message: 'Account is not active' });
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Update last login
  await db.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

  sendTokenResponse(user, 200, res);
});

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const [users] = await db.query(
    'SELECT user_id, email, full_name, phone, role, status, email_verified, profile_image, created_at FROM users WHERE user_id = ?',
    [req.user.id]
  );

  res.json({ success: true, user: users[0] });
});

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (users.length === 0) {
    return res.status(404).json({ success: false, message: 'No user found with this email' });
  }

  // Generate reset token
  const resetToken = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);

  const expiry = new Date(Date.now() + 3600000);
  await db.query(
    'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
    [resetToken, expiry, email]
  );

  res.json({ success: true, message: 'Password reset email sent', resetToken });
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
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
  const password_hash = await bcrypt.hash(password, salt);

  await db.query(
    'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = ?',
    [password_hash, users[0].user_id]
  );

  res.json({ success: true, message: 'Password reset successful' });
});
