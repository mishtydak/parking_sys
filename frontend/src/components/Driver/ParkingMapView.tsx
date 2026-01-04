import React, { useEffect, useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import '../../styles/parkingMap.css';

interface ParkingMapViewProps {
  zoneId: string;
}

const ParkingMapView: React.FC<ParkingMapViewProps> = ({ zoneId }) => {
  const { slots, fetchSlotsByZone, selectedZone } = useParking();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    if (zoneId) {
      fetchSlotsByZone(zoneId);
    }
  }, [zoneId, fetchSlotsByZone]);

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
  };

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'occupied':
        return 'red';
      case 'reserved':
        return 'orange';
      case 'maintenance':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <div className="parking-map-view">
      <h2>{selectedZone?.name} - Parking Map</h2>
      <div className="parking-map">
        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'green' }}></span>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'red' }}></span>
            <span>Occupied</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'orange' }}></span>
            <span>Reserved</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'gray' }}></span>
            <span>Maintenance</span>
          </div>
        </div>
        
        <div className="parking-slots-grid">
          {slots.map(slot => (
            <div 
              key={slot._id} 
              className={`parking-slot ${slot._id === selectedSlot ? 'selected' : ''}`}
              style={{ backgroundColor: getSlotStatusColor(slot.status) }}
              onClick={() => handleSlotSelect(slot._id)}
            >
              <div className="slot-number">{slot.slotNumber}</div>
              <div className="slot-status">{slot.status}</div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedSlot && (
        <div className="selected-slot-info">
          <h3>Selected Slot: {slots.find(s => s._id === selectedSlot)?.slotNumber}</h3>
          <p>Status: {slots.find(s => s._id === selectedSlot)?.status}</p>
          <p>Type: {slots.find(s => s._id === selectedSlot)?.type}</p>
        </div>
      )}
    </div>
  );
};

export default ParkingMapView;