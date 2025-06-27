// authController.js
const User = require('../models/userModel');
const authService = require('../service/authService');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 */
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await authService.createUser({
    name: {
      firstName: req.body.firstName,
      lastName: req.body.lastName
    },
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    role: req.body.role || 'PARTICIPANT'
  });

  const token = authService.generateToken(newUser._id);
  
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: authService.sanitizeUser(newUser)
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  
  // 2) Check if user exists and password is correct
  const user = await authService.validateUser(email, password);
  
  // 3) Generate token
  const token = authService.generateToken(user._id);
  
  // 4) Send response
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: authService.sanitizeUser(user)
    }
  });
});

/**
 * @desc    Logout user
 * @route   GET /api/auth/logout
 */
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({ 
    status: 'success',
    message: 'Successfully logged out'
  });
};

/**
 * @desc    Protect routes - require authentication
 */
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verify token
  const decoded = await authService.verifyToken(token);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) Grant access to protected route
  req.user = currentUser;
  next();
});

/**
 * @desc    Restrict access to specific roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
