import React, { useEffect, useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import '../../styles/operator.css';

interface OccupancyMonitorProps {
  zoneId: string;
}

const OccupancyMonitor: React.FC<OccupancyMonitorProps> = ({ zoneId }) => {
  const { slots, fetchSlotsByZone, selectedZone } = useParking();
  const [occupancyData, setOccupancyData] = useState({
    total: 0,
    occupied: 0,
    available: 0,
    reserved: 0
  });

  useEffect(() => {
    if (zoneId) {
      fetchSlotsByZone(zoneId);
    }
  }, [zoneId, fetchSlotsByZone]);

  useEffect(() => {
    // Calculate occupancy statistics
    const total = slots.length;
    const occupied = slots.filter(slot => slot.status === 'occupied').length;
    const available = slots.filter(slot => slot.status === 'available').length;
    const reserved = slots.filter(slot => slot.status === 'reserved').length;

    setOccupancyData({
      total,
      occupied,
      available,
      reserved
    });
  }, [slots]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#4CAF50'; // Green
      case 'occupied':
        return '#F44336'; // Red
      case 'reserved':
        return '#FF9800'; // Orange
      case 'maintenance':
        return '#9E9E9E'; // Gray
      default:
        return '#9E9E9E';
    }
  };

  return (
    <div className="occupancy-monitor">
      <h2>{selectedZone?.name} - Occupancy Monitor</h2>
      
      <div className="occupancy-stats">
        <div className="stat-card">
          <h3>Total Slots</h3>
          <p className="stat-value">{occupancyData.total}</p>
        </div>
        <div className="stat-card">
          <h3>Occupied</h3>
          <p className="stat-value" style={{ color: '#F44336' }}>{occupancyData.occupied}</p>
        </div>
        <div className="stat-card">
          <h3>Available</h3>
          <p className="stat-value" style={{ color: '#4CAF50' }}>{occupancyData.available}</p>
        </div>
        <div className="stat-card">
          <h3>Reserved</h3>
          <p className="stat-value" style={{ color: '#FF9800' }}>{occupancyData.reserved}</p>
        </div>
      </div>
      
      <div className="occupancy-chart">
        <h3>Occupancy Distribution</h3>
        <div className="chart-bar">
          <div 
            className="bar-segment" 
            style={{ 
              width: `${occupancyData.total ? (occupancyData.occupied / occupancyData.total) * 100 : 0}%`, 
              backgroundColor: '#F44336' 
            }}
          >
            Occupied ({occupancyData.occupied})
          </div>
          <div 
            className="bar-segment" 
            style={{ 
              width: `${occupancyData.total ? (occupancyData.available / occupancyData.total) * 100 : 0}%`, 
              backgroundColor: '#4CAF50' 
            }}
          >
            Available ({occupancyData.available})
          </div>
          <div 
            className="bar-segment" 
            style={{ 
              width: `${occupancyData.total ? (occupancyData.reserved / occupancyData.total) * 100 : 0}%`, 
              backgroundColor: '#FF9800' 
            }}
          >
            Reserved ({occupancyData.reserved})
          </div>
        </div>
      </div>
      
      <div className="slots-list">
        <h3>All Slots</h3>
        <div className="slots-grid">
          {slots.map(slot => (
            <div 
              key={slot._id} 
              className="slot-item"
              style={{ borderLeft: `5px solid ${getStatusColor(slot.status)}` }}
            >
              <div className="slot-info">
                <h4>{slot.slotNumber}</h4>
                <p className="slot-status">{slot.status}</p>
                <p>Type: {slot.type}</p>
                {slot.currentVehicle && (
                  <p>Vehicle: {slot.currentVehicle.licensePlate}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OccupancyMonitor;