// backend/src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const asyncHandler = require('express-async-handler');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database with organization info
    const [users] = await db.query(
      `SELECT u.*, o.org_name, o.org_logo 
       FROM users u 
       LEFT JOIN organizations o ON u.org_id = o.org_id 
       WHERE u.user_id = ?`,
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Add user to request object
    req.user = {
      id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      org_id: user.org_id,
      org_name: user.org_name,
      org_logo: user.org_logo
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Middleware for organization access control
exports.authorizeOrgAccess = () => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;
    
    // Super admin has access to everything
    if (user.role === 'super_admin') {
      return next();
    }

    // Check if user is trying to access their own organization
    const orgId = req.params.orgId || req.body.org_id || req.query.org_id;
    
    if (orgId && parseInt(orgId) !== parseInt(user.org_id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this organization'
      });
    }

    next();
  });
};