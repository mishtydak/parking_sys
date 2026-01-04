// Demo Configuration
export const DEMO_USER = {
  driver: {
    _id: 'demoDriver123',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    role: 'driver'
  },
  operator: {
    _id: 'demoOperator123',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    role: 'operator'
  },
  admin: {
    _id: 'demoAdmin123',
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    role: 'admin'
  }
};

// Default demo user role
export const DEFAULT_DEMO_ROLE = 'admin'; // Change this to 'driver', 'operator', or 'admin' as needed