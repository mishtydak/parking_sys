import React from 'react';
import { useParking } from '../../context/ParkingContext';

interface SlotStatusProps {
  slotId: string;
}

const SlotStatus: React.FC<SlotStatusProps> = ({ slotId }) => {
  const { slots } = useParking();
  const slot = slots.find(s => s._id === slotId);

  if (!slot) {
    return <div>Slot not found</div>;
  }

  const getStatusColor = (status: string) => {
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
    <div className="slot-status">
      <h4>Slot: {slot.slotNumber}</h4>
      <div className="status-info">
        <span 
          className="status-indicator" 
          style={{ backgroundColor: getStatusColor(slot.status) }}
        ></span>
        <span className="status-text">{slot.status}</span>
      </div>
      <p>Type: {slot.type}</p>
      {slot.reservedBy && (
        <p>Reserved by: {typeof slot.reservedBy === 'object' ? slot.reservedBy.name : slot.reservedBy}</p>
      )}
      {slot.currentVehicle && (
        <>
          <p>License Plate: {slot.currentVehicle.licensePlate}</p>
          <p>Entry Time: {slot.currentVehicle.entryTime ? new Date(slot.currentVehicle.entryTime).toLocaleString() : 'N/A'}</p>
        </>
      )}
    </div>
  );
};

export default SlotStatus;