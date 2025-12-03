const db = require('../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Create a new organization
// @route   POST /api/organizations
exports.createOrganization = asyncHandler(async (req, res) => {
  const {
    org_name,
    gst_number,
    gst_type,
    gst_percentage,
    address,
    contact_person_name,
    primary_phone,
    secondary_phone
  } = req.body;

  // Validation
  if (!org_name || !contact_person_name || !primary_phone) {
    return res.status(400).json({
      success: false,
      message: 'Organization name, contact person name, and primary phone are required'
    });
  }

  // Check if organization with same GST number already exists (if provided)
  if (gst_number) {
    const [existingOrg] = await db.query('SELECT org_id FROM organizations WHERE gst_number = ?', [gst_number]);
    if (existingOrg.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Organization with this GST number already exists'
      });
    }
  }

  // Handle organization logo
  let org_logo = null;
  if (req.file) {
    org_logo = req.file.path;
  }

  // Insert organization
  const [result] = await db.query(
    `INSERT INTO organizations (
      org_name, org_logo, gst_number, gst_type, gst_percentage,
      address, contact_person_name, primary_phone, secondary_phone,
      added_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      org_name,
      org_logo,
      gst_number || null,
      gst_type || 'NONE',
      parseFloat(gst_percentage) || 0.00,
      address || null,
      contact_person_name,
      primary_phone,
      secondary_phone || null,
      req.user.id
    ]
  );

  // Get the created organization
  const [organizations] = await db.query(
    `SELECT o.*, 
            u1.full_name as added_by_name,
            u2.full_name as updated_by_name
     FROM organizations o
     LEFT JOIN users u1 ON o.added_by = u1.user_id
     LEFT JOIN users u2 ON o.updated_by = u2.user_id
     WHERE o.org_id = ?`,
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    message: 'Organization created successfully',
    organization: organizations[0]
  });
});

// @desc    Get all organizations
// @route   GET /api/organizations
exports.getAllOrganizations = asyncHandler(async (req, res) => {
  const [organizations] = await db.query(
    `SELECT o.*, 
            u1.full_name as added_by_name,
            u2.full_name as updated_by_name,
            COUNT(u.user_id) as total_users
     FROM organizations o
     LEFT JOIN users u1 ON o.added_by = u1.user_id
     LEFT JOIN users u2 ON o.updated_by = u2.user_id
     LEFT JOIN users u ON o.org_id = u.org_id
     GROUP BY o.org_id
     ORDER BY o.created_at DESC`
  );

  res.json({
    success: true,
    count: organizations.length,
    organizations
  });
});

// @desc    Get single organization by ID
// @route   GET /api/organizations/:id
exports.getOrganizationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [organizations] = await db.query(
    `SELECT o.*, 
            u1.full_name as added_by_name,
            u2.full_name as updated_by_name
     FROM organizations o
     LEFT JOIN users u1 ON o.added_by = u1.user_id
     LEFT JOIN users u2 ON o.updated_by = u2.user_id
     WHERE o.org_id = ?`,
    [id]
  );

  if (organizations.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found'
    });
  }

  // Get users belonging to this organization
  const [users] = await db.query(
    `SELECT user_id, full_name, email, phone, role, status, profile_image
     FROM users
     WHERE org_id = ?`,
    [id]
  );

  res.json({
    success: true,
    organization: organizations[0],
    users: users
  });
});

// @desc    Update organization
// @route   PUT /api/organizations/:id
exports.updateOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    org_name,
    gst_number,
    gst_type,
    gst_percentage,
    address,
    contact_person_name,
    primary_phone,
    secondary_phone
  } = req.body;

  // Check if organization exists
  const [existingOrgs] = await db.query('SELECT * FROM organizations WHERE org_id = ?', [id]);
  if (existingOrgs.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found'
    });
  }

  // Check for duplicate GST number (if provided and changed)
  if (gst_number && gst_number !== existingOrgs[0].gst_number) {
    const [duplicateOrgs] = await db.query(
      'SELECT org_id FROM organizations WHERE gst_number = ? AND org_id != ?',
      [gst_number, id]
    );
    if (duplicateOrgs.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Another organization with this GST number already exists'
      });
    }
  }

  // Handle organization logo
  let org_logo = existingOrgs[0].org_logo;
  if (req.file) {
    org_logo = req.file.path;
  }

  // Update organization
  await db.query(
    `UPDATE organizations 
     SET org_name = ?, org_logo = ?, gst_number = ?, gst_type = ?, gst_percentage = ?,
         address = ?, contact_person_name = ?, primary_phone = ?, secondary_phone = ?,
         updated_by = ?, updated_at = NOW()
     WHERE org_id = ?`,
    [
      org_name,
      org_logo,
      gst_number || null,
      gst_type || 'NONE',
      parseFloat(gst_percentage) || 0.00,
      address || null,
      contact_person_name,
      primary_phone,
      secondary_phone || null,
      req.user.id,
      id
    ]
  );

  // Get updated organization
  const [organizations] = await db.query(
    `SELECT o.*, 
            u1.full_name as added_by_name,
            u2.full_name as updated_by_name
     FROM organizations o
     LEFT JOIN users u1 ON o.added_by = u1.user_id
     LEFT JOIN users u2 ON o.updated_by = u2.user_id
     WHERE o.org_id = ?`,
    [id]
  );

  res.json({
    success: true,
    message: 'Organization updated successfully',
    organization: organizations[0]
  });
});

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
exports.deleteOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if organization has users
  const [users] = await db.query('SELECT COUNT(*) as user_count FROM users WHERE org_id = ?', [id]);
  
  if (users[0].user_count > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete organization with associated users. Please reassign or delete users first.'
    });
  }

  const [result] = await db.query('DELETE FROM organizations WHERE org_id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found'
    });
  }

  res.json({
    success: true,
    message: 'Organization deleted successfully'
  });
});

// @desc    Get organizations for dropdown/select
// @route   GET /api/organizations/select
exports.getOrganizationsForSelect = asyncHandler(async (req, res) => {
  const [organizations] = await db.query(
    'SELECT org_id, org_name FROM organizations ORDER BY org_name'
  );

  res.json({
    success: true,
    organizations
  });
});

// @desc    Get organization details
// @route   GET /api/organizations/:id
exports.getOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const [orgs] = await db.query(
    'SELECT * FROM organizations WHERE org_id = ?',
    [id]
  );
  
  if (orgs.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found'
    });
  }
  
  res.json({
    success: true,
    data: orgs[0]
  });
});