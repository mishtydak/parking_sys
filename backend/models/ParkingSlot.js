const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: [true, 'Please add a slot number'],
    trim: true,
    unique: true
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingZone',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  type: {
    type: String,
    enum: ['regular', 'handicapped', 'electric', 'vip'],
    default: 'regular'
  },
  width: {
    type: Number, // in meters
    min: [2, 'Width must be at least 2 meters']
  },
  length: {
    type: Number, // in meters
    min: [4, 'Length must be at least 4 meters']
  },
  features: [{
    type: String
  }],
  isReserved: {
    type: Boolean,
    default: false
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reservationStartTime: {
    type: Date
  },
  reservationEndTime: {
    type: Date
  },
  currentVehicle: {
    licensePlate: String,
    entryTime: Date
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
parkingSlotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (typeof next === 'function') {
    next();
  }
});

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);