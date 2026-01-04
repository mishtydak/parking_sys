const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: true
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingZone',
    required: true
  },
  startTime: {
    type: Date,
    required: [true, 'Please add start time'],
    index: true
  },
  endTime: {
    type: Date,
    required: [true, 'Please add end time']
  },
  actualEntryTime: {
    type: Date
  },
  actualExitTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['reserved', 'active', 'completed', 'cancelled', 'expired'],
    default: 'reserved',
    index: true
  },
  licensePlate: {
    type: String,
    required: [true, 'Please add license plate number'],
    trim: true
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  reservationDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
reservationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (typeof next === 'function') {
    next();
  }
});

module.exports = mongoose.model('Reservation', reservationSchema);