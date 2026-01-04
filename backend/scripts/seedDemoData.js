const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const ParkingZone = require('../models/ParkingZone');
const ParkingSlot = require('../models/ParkingSlot');
const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');

// Function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/supms');
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await ParkingZone.deleteMany({});
    await ParkingSlot.deleteMany({});
    await Reservation.deleteMany({});
    await Payment.deleteMany({});

    // Create users with hashed passwords
    console.log('Creating users...');
    const hashedPassword = await hashPassword('password123');
    const usersData = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        password: hashedPassword,
        role: 'driver'
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        password: hashedPassword,
        role: 'operator'
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@example.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Sunita Reddy',
        email: 'sunita.reddy@example.com',
        password: hashedPassword,
        role: 'driver'
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        password: hashedPassword,
        role: 'operator'
      }
    ];
    const createdUsers = await User.insertMany(usersData);
    console.log(`Created ${createdUsers.length} users`);

    // Create parking zones
    console.log('Creating parking zones...');
    const zonesData = [
      {
        name: 'Connaught Place Central',
        location: {
          type: 'Point',
          coordinates: [77.22634, 28.62872],
          address: 'Block A, Connaught Place, New Delhi, Delhi 110001'
        },
        description: 'Premium parking in the heart of New Delhi',
        totalSlots: 150,
        availableSlots: 42,
        hourlyRate: 50,
        operator: createdUsers[1]._id, // Priya Sharma (operator)
        status: 'active',
        amenities: ['Covered', 'Security', 'Valet Service']
      },
      {
        name: 'Marine Drive Promenade',
        location: {
          type: 'Point',
          coordinates: [72.82852, 18.94572],
          address: 'Marine Drive, Churchgate, Mumbai, Maharashtra 400020'
        },
        description: 'Scenic parking with sea view',
        totalSlots: 200,
        availableSlots: 78,
        hourlyRate: 40,
        operator: createdUsers[4]._id, // Vikram Singh (operator)
        status: 'active',
        amenities: ['Covered', 'Security', 'Electric Vehicle Charging']
      },
      {
        name: 'Brigade Road Hub',
        location: {
          type: 'Point',
          coordinates: [77.57581, 12.97361],
          address: 'Brigade Road, Bangalore, Karnataka 560001'
        },
        description: 'Central location with easy access to shopping areas',
        totalSlots: 120,
        availableSlots: 15,
        hourlyRate: 35,
        operator: createdUsers[4]._id, // Vikram Singh (operator)
        status: 'active',
        amenities: ['Open Air', 'Security', 'Valet Service']
      },
      {
        name: 'T Nagar Plaza',
        location: {
          type: 'Point',
          coordinates: [80.24047, 13.04181],
          address: 'T. Nagar, Chennai, Tamil Nadu 600017'
        },
        description: 'Shopping district parking facility',
        totalSlots: 180,
        availableSlots: 89,
        hourlyRate: 30,
        operator: createdUsers[1]._id, // Priya Sharma (operator)
        status: 'active',
        amenities: ['Covered', 'Security', 'Electric Vehicle Charging']
      },
      {
        name: 'Sector 17 Plaza',
        location: {
          type: 'Point',
          coordinates: [76.77052, 30.73536],
          address: 'Sector 17-C, Chandigarh, 160017'
        },
        description: 'Planned city center parking',
        totalSlots: 100,
        availableSlots: 22,
        hourlyRate: 45,
        operator: createdUsers[4]._id, // Vikram Singh (operator)
        status: 'active',
        amenities: ['Covered', 'Security', 'Valet Service', 'Electric Vehicle Charging']
      }
    ];
    const createdZones = await ParkingZone.insertMany(zonesData);
    console.log(`Created ${createdZones.length} parking zones`);

    // Create parking slots for each zone
    console.log('Creating parking slots...');
    const createdSlots = [];
    
    // Create slots for Connaught Place zone
    for (let i = 1; i <= 150; i++) {
      const slotStatus = i <= 108 ? 'available' : i <= 120 ? 'occupied' : 'reserved';
      const slotTypes = ['regular', 'handicapped', 'electric', 'vip'];
      const slotType = slotTypes[i % slotTypes.length]; // Cycle through available types
      const slotData = {
        slotNumber: `CP-${i.toString().padStart(3, '0')}`,
        zone: createdZones[0]._id,
        status: slotStatus,
        type: slotType,
        width: slotType === 'vip' ? 3.0 : slotType === 'handicapped' ? 2.8 : 2.5,
        length: slotType === 'vip' ? 6.0 : slotType === 'handicapped' ? 5.5 : 5.0,
        features: ['Covered', 'Security']
      };
      
      if (slotStatus === 'occupied') {
        slotData.currentVehicle = {
          licensePlate: `DL01AB${(i + 1000).toString()}`,
          entryTime: new Date(Date.now() - (Math.floor(Math.random() * 6) + 1) * 60 * 60 * 1000) // 1-6 hours ago
        };
      } else if (slotStatus === 'reserved') {
        slotData.isReserved = true;
        slotData.reservedBy = createdUsers[0]._id; // Rajesh Kumar
        slotData.reservationStartTime = new Date(Date.now() + 30 * 60 * 1000); // 30 mins from now
        slotData.reservationEndTime = new Date(Date.now() + (Math.floor(Math.random() * 4) + 1) * 60 * 60 * 1000); // 1-4 hours from now
      }
      
      const createdSlot = await ParkingSlot.create(slotData);
      createdSlots.push(createdSlot);
    }
    
    // Create slots for Marine Drive zone
    for (let i = 1; i <= 200; i++) {
      const slotStatus = i <= 122 ? 'available' : i <= 150 ? 'occupied' : 'reserved';
      const slotTypes = ['regular', 'handicapped', 'electric', 'vip'];
      const slotType = slotTypes[i % slotTypes.length]; // Cycle through available types
      const slotData = {
        slotNumber: `MD-${i.toString().padStart(3, '0')}`,
        zone: createdZones[1]._id,
        status: slotStatus,
        type: slotType,
        width: slotType === 'vip' ? 3.0 : slotType === 'handicapped' ? 2.8 : 2.5,
        length: slotType === 'vip' ? 6.0 : slotType === 'handicapped' ? 5.5 : 5.0,
        features: ['Covered', 'Security', 'Electric Vehicle Charging']
      };
      
      if (slotStatus === 'occupied') {
        slotData.currentVehicle = {
          licensePlate: `MH02CD${(i + 2000).toString()}`,
          entryTime: new Date(Date.now() - (Math.floor(Math.random() * 5) + 1) * 60 * 60 * 1000) // 1-5 hours ago
        };
      } else if (slotStatus === 'reserved') {
        slotData.isReserved = true;
        slotData.reservedBy = createdUsers[3]._id; // Sunita Reddy
        slotData.reservationStartTime = new Date(Date.now() + 45 * 60 * 1000); // 45 mins from now
        slotData.reservationEndTime = new Date(Date.now() + (Math.floor(Math.random() * 3) + 2) * 60 * 60 * 1000); // 2-4 hours from now
      }
      
      const createdSlot = await ParkingSlot.create(slotData);
      createdSlots.push(createdSlot);
    }
    
    // Create slots for Brigade Road zone
    for (let i = 1; i <= 120; i++) {
      const slotStatus = i <= 105 ? 'available' : i <= 115 ? 'occupied' : 'reserved';
      const slotTypes = ['regular', 'handicapped', 'electric', 'vip'];
      const slotType = slotTypes[i % slotTypes.length]; // Cycle through available types
      const slotData = {
        slotNumber: `BR-${i.toString().padStart(3, '0')}`,
        zone: createdZones[2]._id,
        status: slotStatus,
        type: slotType,
        width: slotType === 'vip' ? 3.0 : slotType === 'handicapped' ? 2.8 : 2.5,
        length: slotType === 'vip' ? 6.0 : slotType === 'handicapped' ? 5.5 : 5.0,
        features: ['Open Air', 'Security', 'Valet Service']
      };
      
      if (slotStatus === 'occupied') {
        slotData.currentVehicle = {
          licensePlate: `KA03EF${(i + 3000).toString()}`,
          entryTime: new Date(Date.now() - (Math.floor(Math.random() * 4) + 1) * 60 * 60 * 1000) // 1-4 hours ago
        };
      } else if (slotStatus === 'reserved') {
        slotData.isReserved = true;
        slotData.reservedBy = createdUsers[0]._id; // Rajesh Kumar
        slotData.reservationStartTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
        slotData.reservationEndTime = new Date(Date.now() + (Math.floor(Math.random() * 2) + 1) * 60 * 60 * 1000); // 1-2 hours from now
      }
      
      const createdSlot = await ParkingSlot.create(slotData);
      createdSlots.push(createdSlot);
    }
    
    // Create slots for T Nagar zone
    for (let i = 1; i <= 180; i++) {
      const slotStatus = i <= 91 ? 'available' : i <= 130 ? 'occupied' : 'reserved';
      const slotTypes = ['regular', 'handicapped', 'electric', 'vip'];
      const slotType = slotTypes[i % slotTypes.length]; // Cycle through available types
      const slotData = {
        slotNumber: `TN-${i.toString().padStart(3, '0')}`,
        zone: createdZones[3]._id,
        status: slotStatus,
        type: slotType,
        width: slotType === 'vip' ? 3.0 : slotType === 'handicapped' ? 2.8 : 2.5,
        length: slotType === 'vip' ? 6.0 : slotType === 'handicapped' ? 5.5 : 5.0,
        features: ['Covered', 'Security', 'Electric Vehicle Charging']
      };
      
      if (slotStatus === 'occupied') {
        slotData.currentVehicle = {
          licensePlate: `TN04GH${(i + 4000).toString()}`,
          entryTime: new Date(Date.now() - (Math.floor(Math.random() * 3) + 2) * 60 * 60 * 1000) // 2-4 hours ago
        };
      } else if (slotStatus === 'reserved') {
        slotData.isReserved = true;
        slotData.reservedBy = createdUsers[3]._id; // Sunita Reddy
        slotData.reservationStartTime = new Date(Date.now() + 90 * 60 * 1000); // 90 mins from now
        slotData.reservationEndTime = new Date(Date.now() + (Math.floor(Math.random() * 3) + 2) * 60 * 60 * 1000); // 2-4 hours from now
      }
      
      const createdSlot = await ParkingSlot.create(slotData);
      createdSlots.push(createdSlot);
    }
    
    // Create slots for Sector 17 zone
    for (let i = 1; i <= 100; i++) {
      const slotStatus = i <= 78 ? 'available' : i <= 90 ? 'occupied' : 'reserved';
      const slotTypes = ['regular', 'handicapped', 'electric', 'vip'];
      const slotType = slotTypes[i % slotTypes.length]; // Cycle through available types
      const slotData = {
        slotNumber: `S17-${i.toString().padStart(3, '0')}`,
        zone: createdZones[4]._id,
        status: slotStatus,
        type: slotType,
        width: slotType === 'vip' ? 3.0 : slotType === 'handicapped' ? 2.8 : 2.5,
        length: slotType === 'vip' ? 6.0 : slotType === 'handicapped' ? 5.5 : 5.0,
        features: ['Covered', 'Security', 'Valet Service', 'Electric Vehicle Charging']
      };
      
      if (slotStatus === 'occupied') {
        slotData.currentVehicle = {
          licensePlate: `CH05IJ${(i + 5000).toString()}`,
          entryTime: new Date(Date.now() - (Math.floor(Math.random() * 5) + 1) * 60 * 60 * 1000) // 1-5 hours ago
        };
      } else if (slotStatus === 'reserved') {
        slotData.isReserved = true;
        slotData.reservedBy = createdUsers[0]._id; // Rajesh Kumar
        slotData.reservationStartTime = new Date(Date.now() + 120 * 60 * 1000); // 2 hours from now
        slotData.reservationEndTime = new Date(Date.now() + (Math.floor(Math.random() * 3) + 1) * 60 * 60 * 1000); // 1-3 hours from now
      }
      
      const createdSlot = await ParkingSlot.create(slotData);
      createdSlots.push(createdSlot);
    }
    
    console.log(`Created ${createdSlots.length} parking slots`);

    // Create reservations
    console.log('Creating reservations...');
    const reservationSlots = createdSlots.filter(slot => slot.status === 'reserved');
    const createdReservations = [];
    
    for (let i = 0; i < Math.min(50, reservationSlots.length); i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * 4)]; // Pick a random driver
      const slot = reservationSlots[i];
      const zone = createdZones.find(z => z._id.toString() === slot.zone.toString());
      
      // Calculate cost based on duration and hourly rate
      const durationInHours = (slot.reservationEndTime.getTime() - slot.reservationStartTime.getTime()) / (1000 * 60 * 60);
      const totalCost = Math.ceil(durationInHours) * zone.hourlyRate;
      
      const licensePlateValue = (slot && slot.currentVehicle && slot.currentVehicle.licensePlate)
        ? slot.currentVehicle.licensePlate
        : `DL01AB${(i + 6000).toString()}`;

      const reservationData = {
        user: randomUser._id,
        slot: slot._id,
        zone: slot.zone,
        startTime: slot.reservationStartTime,
        endTime: slot.reservationEndTime,
        status: ['reserved', 'active'][Math.floor(Math.random() * 2)], // Random status
        licensePlate: String(licensePlateValue),
        totalCost: totalCost,
        paymentStatus: ['pending', 'paid', 'refunded'][Math.floor(Math.random() * 3)] // Random payment status (match Reservation schema)
      };
      
      const createdReservation = await Reservation.create(reservationData);
      createdReservations.push(createdReservation);
    }
    
    console.log(`Created ${createdReservations.length} reservations`);

    // Create payments
    console.log('Creating payments...');
    const completedReservations = createdReservations.filter(r => r.paymentStatus === 'paid');
    
    for (let i = 0; i < Math.min(30, completedReservations.length); i++) {
      const reservation = completedReservations[i];
      const paymentMethods = ['upi', 'credit_card', 'debit_card', 'paypal', 'digital_wallet'];
      const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      const paymentData = {
        reservation: reservation._id,
        user: reservation.user,
        amount: reservation.totalCost,
        paymentMethod: randomMethod,
        status: reservation.paymentStatus === 'paid' ? 'completed' : 'pending',
        transactionId: `TXN-${Date.now()}-${i.toString().padStart(4, '0')}`,
        gatewayResponse: {
          status: reservation.paymentStatus === 'paid' ? 'succeeded' : 'pending',
          payment_method: randomMethod,
          amount: reservation.totalCost,
          currency: 'INR',
          timestamp: new Date()
        }
      };
      
      await Payment.create(paymentData);
    }
    
    console.log(`Created ${Math.min(30, completedReservations.length)} payments`);

    // Update zone available slots counts based on actual data
    console.log('Updating zone slot counts...');
    for (const zone of createdZones) {
      const totalSlots = await ParkingSlot.countDocuments({ zone: zone._id });
      const availableSlots = await ParkingSlot.countDocuments({ zone: zone._id, status: 'available' });
      
      zone.totalSlots = totalSlots;
      zone.availableSlots = availableSlots;
      await zone.save();
    }
    
    console.log('Demo data successfully seeded!');
    console.log(`
Summary:`);
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Parking Zones: ${createdZones.length}`);
    console.log(`- Parking Slots: ${createdSlots.length}`);
    console.log(`- Reservations: ${createdReservations.length}`);
    console.log(`- Payments: ${Math.min(30, completedReservations.length)}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();