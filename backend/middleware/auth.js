// DEMO MODE AUTH MIDDLEWARE
// JWT Removed completely — no token required

const protect = async (req, res, next) => {
  // Fake demo user so system works normally
  req.user = {
    id: "demoUser123",
    name: "Demo User",
    email: "demo@example.com",
    role: "admin"          // change to "driver" or "operator" if you want
  };

  next();
};

// Role Based Access — but also relaxed for demo
const authorize = (...roles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ message: 'Demo Mode: No user found' });
    }

    // allow everything in demo mode
    if (!roles.includes(req.user.role)) {
      console.log("Demo Mode: Ignoring role restriction");
      return next();
    }

    next();
  };
};

module.exports = { protect, authorize };
