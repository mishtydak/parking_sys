import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/dashboard.css';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <div className="welcome-section">
        <h2>Welcome, {user?.name}!</h2>
        <p>Your role: {user?.role}</p>
      </div>
      
      <div className="dashboard-options">
        {user?.role === 'driver' && (
          <div className="option-card">
            <h3>Driver Dashboard</h3>
            <p>Find and reserve parking spaces</p>
            <Link to="/driver" className="btn-primary">Go to Driver Dashboard</Link>
          </div>
        )}
        
        {user?.role === 'operator' && (
          <div className="option-card">
            <h3>Operator Dashboard</h3>
            <p>Manage parking zones and monitor occupancy</p>
            <Link to="/operator" className="btn-primary">Go to Operator Dashboard</Link>
          </div>
        )}
        
        {user?.role === 'admin' && (
          <div className="option-card">
            <h3>Admin Dashboard</h3>
            <p>Monitor city-wide parking and manage users</p>
            <Link to="/admin" className="btn-primary">Go to Admin Dashboard</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;