const express = require('express');
const { 
  getParkingZones, 
  createParkingZone, 
  getParkingSlotsByZone, 
  createReservation, 
  releaseSlot,
  getZoneById 
} = require('../controllers/parking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/zones')
  .get(getParkingZones)
  .post(protect, authorize('admin', 'operator'), createParkingZone);

router.route('/zones/:id')
  .get(getZoneById);

router.route('/slots/:zoneId')
  .get(getParkingSlotsByZone);

router.route('/reserve')
  .post(protect, createReservation);

router.route('/release')
  .post(protect, releaseSlot);

module.exports = router;