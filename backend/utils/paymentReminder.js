const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');
const User = require('../models/User');
const ParkingSlot = require('../models/ParkingSlot');
const ParkingZone = require('../models/ParkingZone');

class PaymentReminder {
  constructor(io) {
    this.io = io;
    this.checkInterval = null;
  }

  start() {
    // Check for upcoming expirations every minute
    this.checkInterval = setInterval(async () => {
      await this.checkForReminders();
    }, 60000); // 1 minute interval

    console.log('Payment reminder service started');
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('Payment reminder service stopped');
    }
  }

  async checkForReminders() {
    try {
      // Find reservations that are active and will expire soon
      const now = new Date();
      const reminderTime = 30 * 60 * 1000; // 30 minutes in milliseconds
      
      // Find reservations that will expire in the next 30 minutes but haven't been reminded yet
      const upcomingExpirations = await Reservation.find({
        status: 'active',
        endTime: { 
          $gte: new Date(now.getTime() + 5 * 60 * 1000), // At least 5 minutes from now
          $lte: new Date(now.getTime() + reminderTime) 
        },
        expiryReminderSent: { $ne: true } // Not yet reminded
      }).populate('user').populate('slot').populate('zone');

      for (const reservation of upcomingExpirations) {
        await this.sendExpiryReminder(reservation);
      }
    } catch (error) {
      console.error('Error in payment reminder check:', error);
    }
  }

  async sendExpiryReminder(reservation) {
    try {
      // Update the reservation to mark that reminder was sent
      reservation.expiryReminderSent = true;
      await reservation.save();

      // In a real application, you would send an actual notification here
      // This could be an email, SMS, push notification, or WebSocket message
      console.log(`Reminder sent for reservation ${reservation._id} ending at ${reservation.endTime}`);

      // Emit a notification to the user via WebSocket
      if (this.io) {
        // Send to the specific user
        this.io.to(`user_${reservation.user._id}`).emit('parkingExpiryReminder', {
          reservationId: reservation._id,
          endTime: reservation.endTime,
          message: `Your parking reservation will expire at ${reservation.endTime}. Please exit the parking zone or extend your reservation.`
        });

        // Also send to the zone for operator awareness
        this.io.to(`zone_${reservation.zone._id}`).emit('parkingExpiryReminder', {
          reservationId: reservation._id,
          slotNumber: reservation.slot.slotNumber,
          endTime: reservation.endTime,
          message: `Reservation for slot ${reservation.slot.slotNumber} will expire at ${reservation.endTime}`
        });
      }

      // In a real application, you might also want to send an email or SMS
      // await this.sendEmailReminder(reservation);
      // await this.sendSMSReminder(reservation);
    } catch (error) {
      console.error('Error sending expiry reminder:', error);
    }
  }

  async checkForExpiredReservations() {
    try {
      const now = new Date();
      
      // Find reservations that have expired but not yet processed
      const expiredReservations = await Reservation.find({
        status: { $in: ['active', 'reserved'] },
        endTime: { $lt: now },
        actualExitTime: null // Not yet marked as exited
      });

      for (const reservation of expiredReservations) {
        await this.handleExpiredReservation(reservation);
      }
    } catch (error) {
      console.error('Error checking for expired reservations:', error);
    }
  }

  async handleExpiredReservation(reservation) {
    try {
      // Update reservation status
      reservation.status = 'expired';
      reservation.actualExitTime = new Date();
      await reservation.save();

      // Update slot status
      const slot = await ParkingSlot.findById(reservation.slot);
      if (slot) {
        slot.status = 'available';
        slot.isReserved = false;
        slot.reservedBy = undefined;
        slot.reservationStartTime = undefined;
        slot.reservationEndTime = undefined;
        slot.currentVehicle = undefined;
        await slot.save();

        // Update zone available slots
        const zone = await ParkingZone.findById(reservation.zone);
        if (zone) {
          zone.availableSlots = Math.min(zone.totalSlots, zone.availableSlots + 1);
          await zone.save();

          // Emit real-time update to clients
          if (this.io) {
            this.io.to(`zone_${zone._id}`).emit('slotUpdate', slot);
            this.io.to(`zone_${zone._id}`).emit('zoneUpdate', zone);
          }
        }
      }

      console.log(`Reservation ${reservation._id} has expired and slot has been released`);
    } catch (error) {
      console.error('Error handling expired reservation:', error);
    }
  }
}

module.exports = PaymentReminder;