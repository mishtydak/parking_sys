const Payment = require('../models/Payment');
const Reservation = require('../models/Reservation');
const ParkingSlot = require('../models/ParkingSlot');
const ParkingZone = require('../models/ParkingZone');
const paymentProcessor = require('../utils/paymentProcessor');

// @desc    Process payment for a reservation
// @route   POST /api/payment
// @access  Private
const processPayment = async (req, res) => {
  try {
    const { reservationId, paymentMethod } = req.body;

    // Find the reservation
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Check if the user owns this reservation
    if (reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this reservation' });
    }

    // Check if reservation is still valid for payment
    if (reservation.status !== 'reserved' && reservation.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Reservation is not in a valid state for payment' });
    }

    // Process payment with payment gateway
    const paymentData = {
      amount: reservation.totalCost,
      currency: 'USD',
      paymentMethod,
      // Add payment method specific data based on the method
      ...(paymentMethod === 'credit_card' || paymentMethod === 'debit_card' ? {
        cardNumber: req.body.cardNumber,
        expiryDate: req.body.expiryDate,
        cvv: req.body.cvv
      } : {}),
      ...(paymentMethod === 'paypal' ? {
        paypalEmail: req.body.paypalEmail
      } : {}),
      ...(paymentMethod === 'digital_wallet' ? {
        walletId: req.body.walletId
      } : {})
    };

    let paymentResult;
    try {
      paymentResult = await paymentProcessor.processPayment(paymentData);
    } catch (paymentError) {
      return res.status(400).json({ success: false, message: paymentError.message });
    }

    // Create payment record
    const payment = await Payment.create({
      reservation: reservationId,
      user: req.user.id,
      amount: reservation.totalCost,
      currency: paymentResult.currency,
      paymentMethod,
      paymentStatus: paymentResult.status,
      transactionId: paymentResult.transactionId,
      gatewayResponse: paymentResult.gatewayResponse
    });

    // Update reservation status to active
    reservation.status = 'active';
    reservation.paymentStatus = 'paid';
    reservation.actualEntryTime = new Date();
    await reservation.save();

    // Update slot status to occupied
    const slot = await ParkingSlot.findById(reservation.slot);
    slot.status = 'occupied';
    slot.currentVehicle = {
      licensePlate: reservation.licensePlate,
      entryTime: new Date()
    };
    await slot.save();

    // Update zone available slots
    const zone = await ParkingZone.findById(reservation.zone);
    zone.availableSlots = Math.max(0, zone.availableSlots - 1);
    await zone.save();

    // Emit real-time update to clients
    req.app.get('io').to(reservation.zone.toString()).emit('slotUpdate', slot);
    req.app.get('io').emit('zoneUpdate', zone);

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get payment by reservation
// @route   GET /api/payment/reservation/:reservationId
// @access  Private
const getPaymentByReservation = async (req, res) => {
  try {
    const payment = await Payment.findOne({ reservation: req.params.reservationId })
      .populate('reservation', 'startTime endTime totalCost status')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Check if user owns this payment or is an admin
    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  processPayment,
  getPaymentByReservation
};