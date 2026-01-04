const mongoose = require('mongoose');

const parkingZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    },
    address: {
      type: String,
      required: true,
      trim: true
    }
  },
  description: {
    type: String,
    trim: true
  },
  totalSlots: {
    type: Number,
    required: [true, 'Please add total number of slots'],
    min: [1, 'Must have at least 1 slot']
  },
  availableSlots: {
    type: Number,
    default: 0
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Please add hourly rate'],
    min: [0, 'Hourly rate cannot be negative']
  },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  amenities: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update available slots before saving
parkingZoneSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (typeof next === 'function') {
    next();
  }
});

module.exports = mongoose.model('ParkingZone', parkingZoneSchema);