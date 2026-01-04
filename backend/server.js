const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const PaymentReminder = require('./utils/paymentReminder');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket Setup
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const parkingRoutes = require('./routes/parking');
const paymentRoutes = require('./routes/payment');
const usersRoutes = require('./routes/users');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', usersRoutes);

// Demo mode route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Urban Parking Management System API',
    mode: 'demo',
    demo_user: {
      id: 'demoUser123',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'admin'
    }
  });
});

// Socket Events
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("joinParkingZone", (zoneId) => {
    socket.join(zoneId);
    console.log(`User ${socket.id} joined Zone ${zoneId}`);
  });

  socket.on("leaveParkingZone", (zoneId) => {
    socket.leave(zoneId);
    console.log(`User ${socket.id} left Zone ${zoneId}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

// Make io available in routes
app.set("io", io);

const PORT = process.env.PORT || 5000;

// =============================
// CONNECT MONGODB (Fixed Part)
// =============================
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/supms")
  .then(() => {
    console.log("Connected to MongoDB");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      // Start Payment Reminder
      const paymentReminder = new PaymentReminder(io);
      paymentReminder.start();

      // Stop service safely on shutdown
      process.on("SIGINT", () => {
        paymentReminder.stop();
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
