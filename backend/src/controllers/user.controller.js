const db = require('../config/database');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

// @desc    Get all users (Admin only) - Filtered by organization
// @route   GET /api/users
exports.getAllUsers = asyncHandler(async (req, res) => {
  // Get the logged-in user's organization
  const [currentUser] = await db.query(
    'SELECT org_id, role FROM users WHERE user_id = ?',
    [req.user.id]
  );

  let query = `
    SELECT user_id, email, full_name, phone, role, profile_image, status, 
           email_verified, gender, date_of_birth, created_at, base_salary, 
           target_amount, incentive_percentage, incentive_amount, org_id
    FROM users 
    WHERE 1=1
  `;
  
  let params = [];

  // If user is not super_admin, filter by organization
  if (req.user.role !== 'super_admin') {
    query += ' AND org_id = ?';
    params.push(currentUser[0].org_id);
  }

  // Exclude super_admin from list if current user is not super_admin
  if (req.user.role !== 'super_admin') {
    query += ' AND role != "super_admin"';
  }

  query += ' ORDER BY created_at DESC';

  const [users] = await db.query(query, params);
  
  // Get organization names for each user
  const usersWithOrg = await Promise.all(users.map(async (user) => {
    if (user.org_id) {
      const [orgs] = await db.query(
        'SELECT org_name FROM organizations WHERE org_id = ?',
        [user.org_id]
      );
      return { ...user, org_name: orgs[0]?.org_name || null };
    }
    return { ...user, org_name: null };
  }));

  res.json({ 
    success: true, 
    count: usersWithOrg.length, 
    users: usersWithOrg 
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
exports.getProfile = asyncHandler(async (req, res) => {
  const [users] = await db.query(
    'SELECT user_id, email, full_name, phone, date_of_birth, gender, profile_image, role, status, email_verified, created_at, base_salary, org_id FROM users WHERE user_id = ?',
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

// @desc    Update user (Admin only) - With organization check
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
    incentive_percentage,
    org_id
  } = req.body;

  // Get current user's organization
  const [currentUser] = await db.query(
    'SELECT org_id, role FROM users WHERE user_id = ?',
    [req.user.id]
  );

  // Check if user exists
  const [existingUsers] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
  if (existingUsers.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if current user has permission to edit this user
  // Super admin can edit anyone, others can only edit users in their organization
  if (req.user.role !== 'super_admin' && 
      existingUsers[0].org_id !== currentUser[0].org_id) {
    return res.status(403).json({
      success: false,
      message: 'You can only edit users in your organization'
    });
  }

  // Calculate incentive amount
  const incentiveAmount = target_amount && incentive_percentage ? 
    (parseFloat(target_amount) * parseFloat(incentive_percentage)) / 100 : 
    existingUsers[0].incentive_amount;

  // Handle profile image
  let profileImage = existingUsers[0].profile_image;
  if (req.file) {
    profileImage = req.file.path;
  }

  // Check organization assignment - only super admin can change organizations
  let finalOrgId = existingUsers[0].org_id;
  if (req.user.role === 'super_admin' && org_id) {
    finalOrgId = org_id;
  }

  // Update user
  await db.query(
    `UPDATE users 
     SET full_name = ?, email = ?, phone = ?, role = ?, status = ?, 
         date_of_birth = ?, gender = ?, profile_image = ?, 
         base_salary = ?, target_amount = ?, incentive_percentage = ?, incentive_amount = ?,
         org_id = ?, updated_at = NOW() 
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
      finalOrgId,
      id
    ]
  );

  // Get updated user
  const [users] = await db.query(
    `SELECT u.user_id, u.email, u.full_name, u.phone, u.role, u.status, u.profile_image,
            u.base_salary, u.target_amount, u.incentive_percentage, u.incentive_amount,
            u.created_at, u.updated_at, u.org_id,
            o.org_name
     FROM users u
     LEFT JOIN organizations o ON u.org_id = o.org_id
     WHERE u.user_id = ?`,
    [id]
  );

  res.json({
    success: true,
    message: 'User updated successfully',
    user: users[0]
  });
});

// @desc    Set user base salary (Admin only) - With organization check
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

  // Get current user's organization
  const [currentUser] = await db.query(
    'SELECT org_id, role FROM users WHERE user_id = ?',
    [req.user.id]
  );

  // Check if user exists
  const [existingUsers] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
  if (existingUsers.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if current user has permission to edit this user
  if (req.user.role !== 'super_admin' && 
      existingUsers[0].org_id !== currentUser[0].org_id) {
    return res.status(403).json({
      success: false,
      message: 'You can only edit users in your organization'
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

// @desc    Delete user (Admin only) - With organization check
// @route   DELETE /api/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get current user's organization
  const [currentUser] = await db.query(
    'SELECT org_id, role FROM users WHERE user_id = ?',
    [req.user.id]
  );

  // Check if user exists
  const [existingUsers] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
  if (existingUsers.length === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }

  // Check if current user has permission to delete this user
  if (req.user.role !== 'super_admin' && 
      existingUsers[0].org_id !== currentUser[0].org_id) {
    return res.status(403).json({
      success: false,
      message: 'You can only delete users in your organization'
    });
  }

  const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ 
      success: false, 
      message: 'User not found' 
    });
  }

  res.json({ 
    success: true, 
    message: 'User deleted successfully' 
  });
});

// @desc    Get single user by ID - With organization check
// @route   GET /api/users/:id
exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get current user's organization
  const [currentUser] = await db.query(
    'SELECT org_id, role FROM users WHERE user_id = ?',
    [req.user.id]
  );

  const [users] = await db.query(
    `SELECT user_id, email, full_name, phone, role, status, date_of_birth, gender, 
            profile_image, base_salary, target_amount, incentive_percentage, incentive_amount,
            created_at, updated_at, org_id
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

  // Check if current user has permission to view this user
  if (req.user.role !== 'super_admin' && 
      users[0].org_id !== currentUser[0].org_id) {
    return res.status(403).json({
      success: false,
      message: 'You can only view users in your organization'
    });
  }

  // Get organization name
  let org_name = null;
  if (users[0].org_id) {
    const [orgs] = await db.query(
      'SELECT org_name FROM organizations WHERE org_id = ?',
      [users[0].org_id]
    );
    org_name = orgs[0]?.org_name || null;
  }

  res.json({
    success: true,
    user: { ...users[0], org_name }
  });
});

// @desc    Get users by organization (for dropdown)
// @route   GET /api/users/organization/:orgId
exports.getUsersByOrganization = asyncHandler(async (req, res) => {
  const { orgId } = req.params;

  // Check if current user has access to this organization
  const [currentUser] = await db.query(
    'SELECT org_id, role FROM users WHERE user_id = ?',
    [req.user.id]
  );

  if (req.user.role !== 'super_admin' && 
      parseInt(orgId) !== currentUser[0].org_id) {
    return res.status(403).json({
      success: false,
      message: 'You can only view users in your organization'
    });
  }

  const [users] = await db.query(
    `SELECT user_id, full_name, email, phone, role, profile_image, status
     FROM users 
     WHERE org_id = ? AND status = 'active'
     ORDER BY full_name`,
    [orgId]
  );

  res.json({
    success: true,
    count: users.length,
    users
  });
});