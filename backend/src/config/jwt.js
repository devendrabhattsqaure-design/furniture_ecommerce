const jwt = require('jsonwebtoken');

exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

exports.sendTokenResponse = (user, statusCode, res) => {
  const token = this.generateToken({ 
    id: user.user_id, 
    role: user.role 
  });

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  delete user.password_hash;

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user
  });
};
