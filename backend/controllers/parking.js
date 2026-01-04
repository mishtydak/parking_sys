const ParkingZone = require('../models/ParkingZone');
const ParkingSlot = require('../models/ParkingSlot');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

// @desc    Get all parking zones
// @route   GET /api/parking/zones
// @access  Public
const getParkingZones = async (req, res) => {
  try {
    const zones = await ParkingZone.find()
      .populate('operator', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: zones.length,
      data: zones
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get parking zone by ID
// @route   GET /api/parking/zones/:id
// @access  Public
const getZoneById = async (req, res) => {
  try {
    const zone = await ParkingZone.findById(req.params.id)
      .populate('operator', 'name email');

    if (!zone) {
      return res.status(404).json({ success: false, message: 'Parking zone not found' });
    }

    res.status(200).json({
      success: true,
      data: zone
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create a parking zone
// @route   POST /api/parking/zones
// @access  Private
const createParkingZone = async (req, res) => {
  try {
    // Add operator ID from authenticated user
    req.body.operator = req.user.id;

    const zone = await ParkingZone.create(req.body);

    // Create parking slots based on totalSlots
    const slots = [];
    for (let i = 1; i <= zone.totalSlots; i++) {
      slots.push({
        slotNumber: `${zone.name.replace(/\s+/g, '').toUpperCase()}-${i.toString().padStart(3, '0')}`,
        zone: zone._id,
        status: 'available'
      });
    }

    await ParkingSlot.insertMany(slots);

    // Update available slots count
    zone.availableSlots = zone.totalSlots;
    await zone.save();

    res.status(201).json({
      success: true,
      data: zone
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get parking slots by zone
// @route   GET /api/parking/slots/:zoneId
// @access  Public
const getParkingSlotsByZone = async (req, res) => {
  try {
    const zone = await ParkingZone.findById(req.params.zoneId);

    if (!zone) {
      return res.status(404).json({ success: false, message: 'Parking zone not found' });
    }

    const slots = await ParkingSlot.find({ zone: req.params.zoneId })
      .populate('reservedBy', 'name email');

    res.status(200).json(slots);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create a reservation
// @route   POST /api/parking/reserve
// @access  Private
const createReservation = async (req, res) => {
  try {
    const { slotId, startTime, endTime, licensePlate } = req.body;

    // Check if slot exists and is available
    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found' });
    }

    if (slot.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Slot is not available' });
    }

    // Check if there's an existing reservation that conflicts with this time
    const existingReservation = await Reservation.findOne({
      slot: slotId,
      status: { $in: ['reserved', 'active'] },
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) }
        }
      ]
    });

    if (existingReservation) {
      return res.status(400).json({ success: false, message: 'Slot is already reserved for this time period' });
    }

    // Calculate cost based on duration and hourly rate
    const zone = await ParkingZone.findById(slot.zone);
    const durationInHours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
    const totalCost = Math.ceil(durationInHours) * zone.hourlyRate;

    // Create reservation
    const reservation = await Reservation.create({
      user: req.user.id,
      slot: slotId,
      zone: slot.zone,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      licensePlate,
      totalCost,
      status: 'reserved'
    });

    // Update slot status
    slot.status = 'reserved';
    slot.isReserved = true;
    slot.reservedBy = req.user.id;
    slot.reservationStartTime = new Date(startTime);
    slot.reservationEndTime = new Date(endTime);
    await slot.save();

    // Update zone available slots
    zone.availableSlots = Math.max(0, zone.availableSlots - 1);
    await zone.save();

    // Emit real-time update to clients
    req.app.get('io').to(slot.zone.toString()).emit('slotUpdate', slot);
    req.app.get('io').emit('zoneUpdate', zone);

    res.status(201).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Release a parking slot
// @route   POST /api/parking/release
// @access  Private
const releaseSlot = async (req, res) => {
  try {
    const { reservationId } = req.body;

    // Find the reservation
    const reservation = await Reservation.findById(reservationId)
      .populate('slot', 'zone')
      .populate('zone');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Check if user owns this reservation or is an admin/operator
    if (reservation.user.toString() !== req.user.id && !['admin', 'operator'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to release this slot' });
    }

    // Update reservation status
    reservation.status = 'completed';
    reservation.actualExitTime = new Date();
    await reservation.save();

    // Update slot status
    const slot = await ParkingSlot.findById(reservation.slot._id);
    slot.status = 'available';
    slot.isReserved = false;
    slot.reservedBy = undefined;
    slot.reservationStartTime = undefined;
    slot.reservationEndTime = undefined;
    slot.currentVehicle = undefined;
    await slot.save();

    // Update zone available slots
    const zone = await ParkingZone.findById(reservation.slot.zone);
    zone.availableSlots = Math.min(zone.totalSlots, zone.availableSlots + 1);
    await zone.save();

    // Emit real-time update to clients
    req.app.get('io').to(reservation.slot.zone.toString()).emit('slotUpdate', slot);
    req.app.get('io').emit('zoneUpdate', zone);

    res.status(200).json({
      success: true,
      message: 'Slot released successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getParkingZones,
  getZoneById,
  createParkingZone,
  getParkingSlotsByZone,
  createReservation,
  releaseSlot
};