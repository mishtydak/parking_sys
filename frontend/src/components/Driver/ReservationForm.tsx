import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/forms.css';

interface ReservationFormProps {
  slotId: string;
  zoneId: string;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ slotId, zoneId }) => {
  const { createReservation, loading } = useParking();
  const navigate = useNavigate();
  
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startTime || !endTime || !licensePlate) {
      setError('Please fill in all fields');
      return;
    }
    
    if (new Date(endTime) <= new Date(startTime)) {
      setError('End time must be after start time');
      return;
    }
    
    try {
      const reservation = await createReservation(slotId, new Date(startTime), new Date(endTime), licensePlate);
      
      if (reservation) {
        // Navigate to payment page after successful reservation
        navigate(`/payment/${reservation._id}`);
      } else {
        setError('Failed to create reservation');
      }
    } catch (err: any) {
      setError(err.message || 'Reservation failed');
    }
  };

  return (
    <div className="reservation-form">
      <h3>Reserve Parking Slot</h3>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="licensePlate">Vehicle Number:</label>
          <input
            type="text"
            id="licensePlate"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            placeholder="Ex: DL01AB1234"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="startTime">Start Time:</label>
          <input
            type="datetime-local"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="endTime">End Time:</label>
          <input
            type="datetime-local"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Reserving...' : 'Reserve Slot'}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;