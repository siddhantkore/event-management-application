// authService.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

exports.createUser = async (userData) => {
  try {
    return await User.create(userData);
  } catch (err) {
    throw new AppError('User creation failed', 400);
  }
};

exports.validateUser = async (email, password) => {
  // Include password in query (since it's select:false by default)
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.comparePassword(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }
  
  return user;
};

exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

exports.sanitizeUser = (user) => {
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.__v;
  return userObj;
};

/**
 * @desc    Update user password
 */
exports.updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  
  // 1) Check if current password is correct
  if (!(await user.comparePassword(currentPassword, user.password))) {
    throw new AppError('Your current password is wrong.', 401);
  }
  
  // 2) Update password
  user.password = newPassword;
  await user.save();
  
  return user;
};
