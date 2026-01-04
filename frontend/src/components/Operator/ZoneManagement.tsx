import React, { useState, useEffect } from 'react';
import { useParking } from '../../context/ParkingContext';
import '../../styles/operator.css';

const ZoneManagement: React.FC = () => {
  const { zones, fetchZones, loading } = useParking();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    totalSlots: 10,
    hourlyRate: 2,
    amenities: '' as string | string[]
  });

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalSlots' || name === 'hourlyRate' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would make an API call to create a new zone
    console.log('Creating zone:', formData);
    
    // Reset form and close
    setFormData({
      name: '',
      address: '',
      totalSlots: 10,
      hourlyRate: 2,
      amenities: ''
    });
    setShowForm(false);
  };

  return (
    <div className="zone-management">
      <div className="management-header">
        <h2>Parking Zone Management</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add New Zone'}
        </button>
      </div>

      {showForm && (
        <form className="zone-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Zone Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address:</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="totalSlots">Total Slots:</label>
            <input
              type="number"
              id="totalSlots"
              name="totalSlots"
              value={formData.totalSlots}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="hourlyRate">Hourly Rate ($):</label>
            <input
              type="number"
              id="hourlyRate"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="amenities">Amenities (comma separated):</label>
            <input
              type="text"
              id="amenities"
              name="amenities"
              value={typeof formData.amenities === 'string' ? formData.amenities : ''}
              onChange={(e) => setFormData({...formData, amenities: e.target.value})}
              placeholder="e.g., EV charging, covered, security"
            />
          </div>
          
          <button type="submit" className="btn-primary">Create Zone</button>
        </form>
      )}

      <div className="zones-list">
        <h3>Existing Zones</h3>
        {loading ? (
          <p>Loading zones...</p>
        ) : (
          <div className="zones-grid">
            {zones.map(zone => (
              <div key={zone._id} className="zone-card">
                <h4>{zone.name}</h4>
                <p>{zone.location.address}</p>
                <p>Occupancy: {zone.totalSlots - zone.availableSlots}/{zone.totalSlots}</p>
                <p>Hourly Rate: ${zone.hourlyRate}</p>
                <p>Status: {zone.status}</p>
                <div className="zone-actions">
                  <button className="btn-secondary">View Details</button>
                  <button className="btn-secondary">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneManagement;