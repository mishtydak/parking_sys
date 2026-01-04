import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/dashboard.css';

const AdminDashboard: React.FC = () => {
  // Demo analytics data
  const parkingStats = {
    totalZones: 25,
    totalSlots: 2450,
    occupiedSlots: 1890,
    occupancyRate: 77.1,
    dailyRevenue: 125000,
    monthlyRevenue: 3250000
  };
  
  const recentUsers = [
    { id: 'user1', name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'driver', joinDate: '2025-01-15' },
    { id: 'user2', name: 'Priya Sharma', email: 'priya@example.com', role: 'operator', joinDate: '2025-01-14' },
    { id: 'user3', name: 'Amit Patel', email: 'amit@example.com', role: 'driver', joinDate: '2025-01-12' },
    { id: 'user4', name: 'Sunita Reddy', email: 'sunita@example.com', role: 'driver', joinDate: '2025-01-10' },
    { id: 'user5', name: 'Vikram Singh', email: 'vikram@example.com', role: 'operator', joinDate: '2025-01-08' }
  ];
  
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-nav">
        <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
      </div>
      
      <section className="admin-stats">
        <h2>System Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{parkingStats.totalZones}</h3>
            <p>Total Zones</p>
          </div>
          <div className="stat-card">
            <h3>{parkingStats.totalSlots}</h3>
            <p>Total Slots</p>
          </div>
          <div className="stat-card">
            <h3>{parkingStats.occupancyRate}%</h3>
            <p>Occupancy Rate</p>
          </div>
          <div className="stat-card">
            <h3>₹{parkingStats.dailyRevenue.toLocaleString()}</h3>
            <p>Daily Revenue</p>
          </div>
        </div>
      </section>
      
      <section className="recent-activity">
        <h2>Recent Users</h2>
        <div className="users-list">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Join Date</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                  <td>{user.joinDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      
      <section className="admin-options">
        <h2>Admin Functions</h2>
        <div className="options-grid">
          <div className="option-card">
            <h3>Manage Users</h3>
            <p>View and manage system users</p>
            <Link to="/admin/users" className="btn-primary">Manage Users</Link>
          </div>
          
          <div className="option-card">
            <h3>Parking Analytics</h3>
            <p>View parking usage statistics</p>
            <Link to="/admin/analytics" className="btn-primary">View Analytics</Link>
          </div>
          
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;