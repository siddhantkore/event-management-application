const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Result = require('../models/resultModel');
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const Register = require('../models/registrationModel');
const sendSuccessResponse = require('../utils/sendSuccessResponse');
const sendErrorResponse = require('../utils/sendErrorResponse');
const certificateService = require('../service/certificateService');

/**
 * @desc    Create/submit result for a user in an event
 * @route   POST /api/results
 * @access  Private (Admin or Event Organizer)
 */
exports.createResult = catchAsync(async (req, res, next) => {
  const { eventId, userId, position, tag, score, category, prize, remarks } = req.body;

  // Validate required fields
  if (!eventId || !userId || !position || !tag) {
    return sendErrorResponse(res, 400, 'Missing required fields: eventId, userId, position, and tag are required');
  }

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return sendErrorResponse(res, 404, 'Event not found');
  }

  // Check permissions - only admin or event organizer can create results
  if (req.user.role !== 'ADMIN' && event.organizerId.toString() !== req.user.id.toString()) {
    return sendErrorResponse(res, 403, 'You do not have permission to create results for this event');
  }

  // Check if user is registered for the event
  const registration = await Register.findOne({ eventId, userId });
  if (!registration) {
    return sendErrorResponse(res, 400, 'User is not registered for this event');
  }

  // Check if result already exists for this user in this event (and category if provided)
  const existingResult = await Result.findOne({ 
    eventId, 
    userId, 
    category: category || null 
  });

  if (existingResult) {
    return sendErrorResponse(res, 400, 'Result already exists for this user in this event');
  }

  // Create result
  const result = await Result.create({
    eventId,
    userId,
    position,
    tag,
    score: score || undefined,
    category: category || undefined,
    prize: prize || undefined,
    remarks: remarks || undefined
  });

  // Populate result for response
  await result.populate('eventId', 'name eventCode startDate endDate');
  await result.populate('userId', 'name username email');

  sendSuccessResponse(res, 201, 'Result created successfully', {
    result
  });
});

/**
 * @desc    Get all results for an event
 * @route   GET /api/results/event/:eventId
 * @access  Public (or Private for event organizer)
 */
exports.getEventResults = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  const { category, sortBy = 'position' } = req.query;

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return sendErrorResponse(res, 404, 'Event not found');
  }

  // Build filter
  const filter = { eventId };
  if (category) {
    filter.category = category;
  }

  // Build sort
  const sort = {};
  if (sortBy === 'position') {
    sort.position = 1;
  } else if (sortBy === 'score') {
    sort.score = -1;
  } else {
    sort.announcedDate = -1;
  }

  const results = await Result.find(filter)
    .populate('userId', 'name username email')
    .populate('eventId', 'name eventCode')
    .sort(sort);

  sendSuccessResponse(res, 200, 'Results retrieved successfully', {
    event: {
      id: event._id,
      name: event.name,
      eventCode: event.eventCode
    },
    results: results.map(result => ({
      id: result._id,
      user: {
        id: result.userId._id,
        name: result.userId.name,
        username: result.userId.username,
        email: result.userId.email
      },
      position: result.position,
      tag: result.tag,
      score: result.score,
      category: result.category,
      prize: result.prize,
      remarks: result.remarks,
      certificate: result.certificate,
      announcedDate: result.announcedDate
    }))
  });
});

/**
 * @desc    Get results for a specific user
 * @route   GET /api/results/user/:userId
 * @access  Private (User can see their own results, Admin can see all)
 */
exports.getUserResults = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { eventId } = req.query;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return sendErrorResponse(res, 404, 'User not found');
  }

  // Check permissions - user can only see their own results unless admin
  if (req.user.role !== 'ADMIN' && req.user.id.toString() !== userId) {
    return sendErrorResponse(res, 403, 'You can only view your own results');
  }

  // Build filter
  const filter = { userId };
  if (eventId) {
    filter.eventId = eventId;
  }

  const results = await Result.find(filter)
    .populate('eventId', 'name eventCode startDate endDate category')
    .sort({ announcedDate: -1 });

  sendSuccessResponse(res, 200, 'User results retrieved successfully', {
    user: {
      id: user._id,
      name: user.name,
      username: user.username
    },
    results: results.map(result => ({
      id: result._id,
      event: {
        id: result.eventId._id,
        name: result.eventId.name,
        eventCode: result.eventId.eventCode,
        startDate: result.eventId.startDate,
        endDate: result.eventId.endDate
      },
      position: result.position,
      tag: result.tag,
      score: result.score,
      category: result.category,
      prize: result.prize,
      remarks: result.remarks,
      certificate: result.certificate,
      announcedDate: result.announcedDate
    }))
  });
});

/**
 * @desc    Get a specific result by ID
 * @route   GET /api/results/:id
 * @access  Public (or Private)
 */
exports.getResultById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return sendErrorResponse(res, 400, 'Invalid result ID format');
  }

  const result = await Result.findById(id)
    .populate('eventId', 'name eventCode startDate endDate organizer')
    .populate('userId', 'name username email phone');

  if (!result) {
    return sendErrorResponse(res, 404, 'Result not found');
  }

  sendSuccessResponse(res, 200, 'Result retrieved successfully', {
    result
  });
});

/**
 * @desc    Update a result
 * @route   PUT /api/results/:id
 * @access  Private (Admin or Event Organizer)
 */
exports.updateResult = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { position, tag, score, category, prize, remarks } = req.body;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return sendErrorResponse(res, 400, 'Invalid result ID format');
  }

  const result = await Result.findById(id);
  if (!result) {
    return sendErrorResponse(res, 404, 'Result not found');
  }

  // Check permissions
  const event = await Event.findById(result.eventId);
  if (req.user.role !== 'ADMIN' && event.organizerId.toString() !== req.user.id.toString()) {
    return sendErrorResponse(res, 403, 'You do not have permission to update this result');
  }

  // Update fields
  if (position !== undefined) result.position = position;
  if (tag !== undefined) result.tag = tag;
  if (score !== undefined) result.score = score;
  if (category !== undefined) result.category = category;
  if (prize !== undefined) result.prize = prize;
  if (remarks !== undefined) result.remarks = remarks;

  await result.save();

  await result.populate('eventId', 'name eventCode');
  await result.populate('userId', 'name username email');

  sendSuccessResponse(res, 200, 'Result updated successfully', {
    result
  });
});

/**
 * @desc    Delete a result
 * @route   DELETE /api/results/:id
 * @access  Private (Admin or Event Organizer)
 */
exports.deleteResult = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return sendErrorResponse(res, 400, 'Invalid result ID format');
  }

  const result = await Result.findById(id);
  if (!result) {
    return sendErrorResponse(res, 404, 'Result not found');
  }

  // Check permissions
  const event = await Event.findById(result.eventId);
  if (req.user.role !== 'ADMIN' && event.organizerId.toString() !== req.user.id.toString()) {
    return sendErrorResponse(res, 403, 'You do not have permission to delete this result');
  }

  await Result.findByIdAndDelete(id);

  sendSuccessResponse(res, 200, 'Result deleted successfully');
});

/**
 * @desc    Generate certificate for a result
 * @route   POST /api/results/:id/certificate
 * @access  Private (Admin, Event Organizer, or Result Owner)
 */
exports.generateCertificate = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return sendErrorResponse(res, 400, 'Invalid result ID format');
  }

  const result = await Result.findById(id)
    .populate('eventId', 'name eventCode startDate endDate organizer')
    .populate('userId', 'name username email');

  if (!result) {
    return sendErrorResponse(res, 404, 'Result not found');
  }

  // Check permissions
  const event = await Event.findById(result.eventId);
  const isOwner = result.userId._id.toString() === req.user.id.toString();
  const isOrganizer = event.organizerId.toString() === req.user.id.toString();
  const isAdmin = req.user.role === 'ADMIN';

  if (!isOwner && !isOrganizer && !isAdmin) {
    return sendErrorResponse(res, 403, 'You do not have permission to generate this certificate');
  }

  // Generate certificate if not already generated
  if (!result.certificate.issued) {
    const certificateData = await certificateService.generateCertificate(result);
    
    result.certificate = {
      issued: true,
      certificateId: certificateData.certificateId,
      issuedDate: new Date(),
      downloadUrl: certificateData.downloadUrl
    };

    await result.save();
  }

  sendSuccessResponse(res, 200, 'Certificate generated successfully', {
    result: {
      id: result._id,
      certificate: result.certificate
    }
  });
});

/**
 * @desc    Get certificate download URL
 * @route   GET /api/results/:id/certificate
 * @access  Private (Admin, Event Organizer, or Result Owner)
 */
exports.getCertificate = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return sendErrorResponse(res, 400, 'Invalid result ID format');
  }

  const result = await Result.findById(id)
    .populate('eventId')
    .populate('userId');

  if (!result) {
    return sendErrorResponse(res, 404, 'Result not found');
  }

  // Check permissions
  const event = await Event.findById(result.eventId);
  const isOwner = result.userId._id.toString() === req.user.id.toString();
  const isOrganizer = event.organizerId.toString() === req.user.id.toString();
  const isAdmin = req.user.role === 'ADMIN';

  if (!isOwner && !isOrganizer && !isAdmin) {
    return sendErrorResponse(res, 403, 'You do not have permission to access this certificate');
  }

  if (!result.certificate.issued) {
    return sendErrorResponse(res, 404, 'Certificate not yet generated');
  }

  sendSuccessResponse(res, 200, 'Certificate retrieved successfully', {
    certificate: {
      certificateId: result.certificate.certificateId,
      downloadUrl: result.certificate.downloadUrl,
      issuedDate: result.certificate.issuedDate
    }
  });
});
