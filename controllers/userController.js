// getProfile() - Get current user profile
// updateProfile() - Update user profile
// deleteProfile() - Delete user account
// getAllUsers() - Admin: Get all users
// getUserById() - Admin: Get user by ID
// updateUserStatus() - Admin: Activate/deactivate user
// deleteUser() - Admin: Delete user
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsync')
const sendSuccessResponse = require('../utils/sendSuccessResponse')
const sendErrorResponse = require('../utils/sendErrorResponse')


// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = catchAsync(async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    sendSuccessResponse(res, 200, 'Profile retrieved successfully', {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        fullName: user.fullName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    sendErrorResponse(res, 500, 'Server error while retrieving profile');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = catchAsync(async (req, res) => {
  try {
    const { firstName, lastName, phone, currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    // Update basic profile information
    if (firstName) user.name.firstName = firstName;
    if (lastName) user.name.lastName = lastName;
    if (phone) user.phone = phone;

    // Handle password update if provided
    if (newPassword) {
      if (!currentPassword) {
        return sendErrorResponse(res, 400, 'Current password is required to update password');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return sendErrorResponse(res, 400, 'Current password is incorrect');
      }

      // Validate new password format
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (newPassword.length < 8 || !passwordRegex.test(newPassword)) {
        return sendErrorResponse(res, 400, 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }

      user.password = newPassword;
    }

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');

    sendSuccessResponse(res, 200, 'Profile updated successfully', {
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        fullName: updatedUser.fullName,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return sendErrorResponse(res, 400, messages.join(', '));
    }
    
    sendErrorResponse(res, 500, 'Server error while updating profile');
  }
});

// @desc    Delete user account (self-deletion)
// @route   DELETE /api/users/profile
// @access  Private
const deleteProfile = catchAsync(async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return sendErrorResponse(res, 400, 'Password is required to delete account');
    }

    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    // Verify password before deletion
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendErrorResponse(res, 400, 'Incorrect password');
    }

    await User.findByIdAndDelete(req.user.id);

    sendSuccessResponse(res, 200, 'Account deleted successfully');
  } catch (error) {
    console.error('Delete profile error:', error);
    sendErrorResponse(res, 500, 'Server error while deleting account');
  }
});

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const isActive = req.query.isActive;
    const search = req.query.search;

    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { 'name.firstName': { $regex: search, $options: 'i' } },
        { 'name.lastName': { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    sendSuccessResponse(res, 200, 'Users retrieved successfully', {
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        fullName: user.fullName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    sendErrorResponse(res, 500, 'Server error while retrieving users');
  }
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return sendErrorResponse(res, 400, 'Invalid user ID format');
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    sendSuccessResponse(res, 200, 'User retrieved successfully', {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        fullName: user.fullName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    sendErrorResponse(res, 500, 'Server error while retrieving user');
  }
});

// @desc    Update user status (Admin only)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return sendErrorResponse(res, 400, 'Invalid user ID format');
    }

    const user = await User.findById(id);

    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    // Prevent admin from deactivating themselves
    if (req.user.id === id && isActive === false) {
      return sendErrorResponse(res, 400, 'You cannot deactivate your own account');
    }

    // Update fields if provided
    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }

    if (role && ['ADMIN', 'ORGANIZER', 'PARTICIPANT', 'VOLUNTEER'].includes(role)) {
      // Prevent admin from changing their own role to non-admin
      if (req.user.id === id && role !== 'ADMIN') {
        return sendErrorResponse(res, 400, 'You cannot change your own admin role');
      }
      user.role = role;
    }

    await user.save();

    sendSuccessResponse(res, 200, 'User status updated successfully', {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        fullName: user.fullName,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return sendErrorResponse(res, 400, messages.join(', '));
    }
    
    sendErrorResponse(res, 500, 'Server error while updating user status');
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return sendErrorResponse(res, 400, 'Invalid user ID format');
    }

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return sendErrorResponse(res, 400, 'You cannot delete your own account');
    }

    const user = await User.findById(id);

    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    await User.findByIdAndDelete(id);

    sendSuccessResponse(res, 200, 'User deleted successfully', {
      deletedUser: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    sendErrorResponse(res, 500, 'Server error while deleting user');
  }
});

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser
};