const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A event must have a name'],
    trim: true,
    maxlength: [100, 'Event name cannot exceed 100 characters']
  },
  eventCode: {
    type: String,
    required: [true, 'A event must have unique code'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Event code cannot exceed 20 characters']
  },
  category: {
    type: String,
    required: [true, 'You must provide category for an event'],
    enum: {
      values: ['Conference', 'Workshop', 'Seminar', 'Webinar', 'Festival', 'Competition', 'Exhibition', 'Cultural', 'Training', 'Other'],
      message: 'Category must be one of the predefined options'
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Event must have a start date'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Start date cannot be in the past'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'Event must have an end date'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['ONGOING', 'UPCOMING', 'COMPLETED'],
      message: 'Status must be ONGOING, UPCOMING, or COMPLETED'
    },
    default: 'UPCOMING'
  },
  description: {
    type: String,
    required: [true, 'Event must have a description'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  organizer: {
    type: String,
    required: [true, 'Event must have an organizer'],
    trim: true,
    maxlength: [100, 'Organizer name cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    min: [0, 'Amount cannot be negative'],
    default: 0
  },
  venue: {
    name: {
      type: String,
      required: [true, 'Venue name is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Venue address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    capacity: {
      type: Number,
      min: [1, 'Venue capacity must be at least 1']
    }
  },
  banner: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        if (!value) return true; // Banner is optional
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(value);
      },
      message: 'Banner must be a valid image file (jpg, jpeg, png, gif, webp)'
    }
  },
  // Additional useful fields
  maxAttendees: {
    type: Number,
    min: [1, 'Maximum attendees must be at least 1']
  },
  currentAttendees: {
    type: Number,
    default: 0,
    min: [0, 'Current attendees cannot be negative']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
eventSchema.index({ eventCode: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ startDate: 1, endDate: 1 });

// Virtual field to check if event is full
eventSchema.virtual('isFull').get(function() {
  if (!this.maxAttendees) return false;
  return this.currentAttendees >= this.maxAttendees;
});

// Virtual field to get event duration in days
eventSchema.virtual('durationDays').get(function() {
  if (!this.startDate || !this.endDate) return 0;
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to automatically update status based on dates
eventSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.endDate < now) {
    this.status = 'COMPLETED';
  } else if (this.startDate <= now && this.endDate >= now) {
    this.status = 'ONGOING';
  } else {
    this.status = 'UPCOMING';
  }
  
  next();
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;