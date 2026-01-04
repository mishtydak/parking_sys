import React, { useEffect } from 'react';
import { useParking } from '../../context/ParkingContext';
import { Link } from 'react-router-dom';
import '../../styles/dashboard.css';

const OperatorDashboard: React.FC = () => {
  const { zones, loading, error, fetchZones } = useParking();

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  return (
    <div className="operator-dashboard">
      <h1>Operator Dashboard</h1>
      <div className="dashboard-nav">
        <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
      </div>
      
      <section className="parking-zones">
        <h2>Your Parking Zones</h2>
        {loading && <p>Loading parking zones...</p>}
        {error && <p className="error">Error: {error}</p>}
        
        <div className="zones-grid">
          {Array.isArray(zones) && zones.map(zone => (
            <div key={zone._id} className="zone-card">
              <h3>{zone.name}</h3>
              <p>{zone.location.address}</p>
              <p>Occupancy: {zone.totalSlots - zone.availableSlots}/{zone.totalSlots}</p>
              <p>Hourly rate: ₹{zone.hourlyRate}</p>
              <p>Status: {zone.status}</p>
              <div className="amenities">
                <strong>Amenities:</strong> {zone.amenities.join(', ')}
              </div>
              <Link to={`/operator/zone/${zone._id}`} className="btn-primary">Manage Zone</Link>
            </div>
          ))}
          {!Array.isArray(zones) && <p>Error: Data is not in expected format</p>}
        </div>
      </section>
    </div>
  );
};

export default OperatorDashboard;