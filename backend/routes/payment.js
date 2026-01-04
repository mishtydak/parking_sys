const express = require('express');
const { processPayment, getPaymentByReservation } = require('../controllers/payment');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, processPayment);

router.route('/reservation/:reservationId')
  .get(protect, getPaymentByReservation);

module.exports = router;