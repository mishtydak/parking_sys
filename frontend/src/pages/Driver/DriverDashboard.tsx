import React, { useEffect } from 'react';
import { useParking } from '../../context/ParkingContext';
import { Link } from 'react-router-dom';
import '../../styles/dashboard.css';


const DriverDashboard: React.FC = () => {
  const { zones, loading, error, fetchZones } = useParking();

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  return (
    <div className="driver-dashboard">
      <h1>Driver Dashboard</h1>
      <div className="dashboard-nav">
        <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
      </div>
      
      <section className="parking-zones">
        <h2>Available Parking Zones</h2>
        {loading && <p>Loading parking zones...</p>}
        {error && <p className="error">Error: {error}</p>}
        
        <div className="zones-grid">
          {Array.isArray(zones) && zones.map(zone => (
            <div key={zone._id} className="zone-card">
              <h3>{zone.name}</h3>
              <p>{zone.location.address}</p>
              <p>Available slots: {zone.availableSlots}/{zone.totalSlots}</p>
              <p>Hourly rate: ₹{zone.hourlyRate}</p>
              <div className="amenities">
                <strong>Amenities:</strong> {zone.amenities.join(', ')}
              </div>
              <Link to={"/payment"} className="btn-primary">View & Reserve</Link>
            </div>
          ))}
          {!Array.isArray(zones) && <p>Error: Data is not in expected format</p>}
        </div>
      </section>
    </div>
  );
};

export default DriverDashboard;