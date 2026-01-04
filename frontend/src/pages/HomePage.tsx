import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/home.css';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <header>
        <h1>Smart Urban Parking Management System</h1>
        <nav>
          {user ? (
            <div>
              <span>Welcome, {user.name}!</span>
              <Link to="/dashboard">Dashboard</Link>
            </div>
          ) : (
            <div>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          )}
        </nav>
      </header>
      
      <main>
        <section className="hero">
          <h2>Find and Reserve Parking Spaces Across Indian Cities</h2>
          <p>Our smart parking system helps you find available parking spaces in real-time across Delhi, Mumbai, Bangalore, Chennai, and other major Indian cities.</p>
          
          {user ? (
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
          ) : (
            <div className="cta-buttons">
              <Link to="/register" className="btn-primary">Sign Up</Link>
              <Link to="/login" className="btn-secondary">Login</Link>
            </div>
          )}
        </section>
        
        <section className="features">
          <Link to="/driver" className="feature-card">
            <h3>Real-time Availability</h3>
            <p>Check live parking availability in cities like Delhi, Mumbai, Bangalore, Chennai</p>
          </Link>
          <Link to="/driver" className="feature-card">
            <h3>Easy Reservation</h3>
            <p>Book your parking spot in prime locations like Connaught Place, Marine Drive</p>
          </Link>
          <Link to="/driver" className="feature-card">
            <h3>Digital Payments</h3>
            <p>Pay using UPI, Cards, or Digital Wallets - accepted across India</p>
          </Link>
        </section>
      </main>
    </div>
  );
};

export default HomePage;