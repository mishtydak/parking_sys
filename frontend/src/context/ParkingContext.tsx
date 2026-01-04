import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import * as SocketIOClient from 'socket.io-client';
import socketService from '../services/socketService';

interface ParkingZone {
  _id: string;
  name: string;
  location: {
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  description?: string;
  totalSlots: number;
  availableSlots: number;
  hourlyRate: number;
  operator: string;
  status: string;
  amenities: string[];
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface ParkingSlot {
  _id: string;
  slotNumber: string;
  zone: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  type: string;
  width?: number;
  length?: number;
  features: string[];
  isReserved: boolean;
  reservedBy?: string | User;
  reservationStartTime?: Date;
  reservationEndTime?: Date;
  currentVehicle?: {
    licensePlate: string;
    entryTime: Date;
  };
}

interface Reservation {
  _id: string;
  user: string | User;
  slot: string | ParkingSlot;
  zone: string | ParkingZone;
  startTime: Date;
  endTime: Date;
  actualEntryTime?: Date;
  actualExitTime?: Date;
  status: string;
  licensePlate: string;
  totalCost: number;
  paymentStatus: string;
  createdAt: Date;
}

interface ParkingContextType {
  zones: ParkingZone[];
  slots: ParkingSlot[];
  reservations: Reservation[];
  selectedZone: ParkingZone | null;
  setSelectedZone: (zone: ParkingZone | null) => void;
  loading: boolean;
  error: string | null;
  fetchZones: () => Promise<void>;
  fetchSlotsByZone: (zoneId: string) => Promise<void>;
  createReservation: (slotId: string, startTime: Date, endTime: Date, licensePlate: string) => Promise<Reservation | null>;
  releaseSlot: (reservationId: string) => Promise<void>;
  socket: any;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};

interface ParkingProviderProps {
  children: ReactNode;
}

export const ParkingProvider: React.FC<ParkingProviderProps> = ({ children }) => {
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Initialize socket connection
    const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    socketService.connect(serverUrl);

    // Join parking zone updates
    if (selectedZone) {
      socketService.joinParkingZone(selectedZone._id);
    }

    // Listen for real-time updates
    const handleSlotUpdate = (updatedSlot: ParkingSlot) => {
      setSlots(prevSlots => 
        prevSlots.map(slot => 
          slot._id === updatedSlot._id ? updatedSlot : slot
        )
      );
    };

    const handleZoneUpdate = (updatedZone: ParkingZone) => {
      setZones(prevZones => 
        prevZones.map(zone => 
          zone._id === updatedZone._id ? updatedZone : zone
        )
      );
    };

    socketService.onSlotUpdate(handleSlotUpdate);
    socketService.onZoneUpdate(handleZoneUpdate);

    return () => {
      socketService.offSlotUpdate(handleSlotUpdate);
      socketService.offZoneUpdate(handleZoneUpdate);
      socketService.disconnect();
    };
  }, [selectedZone]);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/parking/zones`);
      // Ensure response.data is an array
      setZones(Array.isArray(response.data.data) ? response.data.data : response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching parking zones');
      console.error('Error fetching zones:', err);
      
      // Demo data for Indian parking zones
      setZones([
        {
          _id: 'zone1',
          name: 'Connaught Place Central',
          location: {
            coordinates: [77.22634, 28.62872],
            address: 'Block A, Connaught Place, New Delhi, Delhi 110001'
          },
          description: 'Premium parking in the heart of New Delhi',
          totalSlots: 150,
          availableSlots: 42,
          hourlyRate: 50,
          operator: 'Delhi Parking Authority',
          status: 'active',
          amenities: ['Covered', 'Security', 'Valet Service']
        },
        {
          _id: 'zone2',
          name: 'Marine Drive Promenade',
          location: {
            coordinates: [72.82852, 18.94572],
            address: 'Marine Drive, Churchgate, Mumbai, Maharashtra 400020'
          },
          description: 'Scenic parking with sea view',
          totalSlots: 200,
          availableSlots: 78,
          hourlyRate: 40,
          operator: 'Mumbai Parking Services',
          status: 'active',
          amenities: ['Covered', 'Security', 'Electric Vehicle Charging']
        },
        {
          _id: 'zone3',
          name: 'Brigade Road Hub',
          location: {
            coordinates: [77.57581, 12.97361],
            address: 'Brigade Road, Bangalore, Karnataka 560001'
          },
          description: 'Central location with easy access to shopping areas',
          totalSlots: 120,
          availableSlots: 15,
          hourlyRate: 35,
          operator: 'Bangalore City Parking',
          status: 'active',
          amenities: ['Open Air', 'Security', 'Valet Service']
        },
        {
          _id: 'zone4',
          name: 'T Nagar Plaza',
          location: {
            coordinates: [80.24047, 13.04181],
            address: 'T. Nagar, Chennai, Tamil Nadu 600017'
          },
          description: 'Shopping district parking facility',
          totalSlots: 180,
          availableSlots: 89,
          hourlyRate: 30,
          operator: 'Chennai Municipal Parking',
          status: 'active',
          amenities: ['Covered', 'Security', 'Electric Vehicle Charging']
        },
        {
          _id: 'zone5',
          name: 'Sector 17 Plaza',
          location: {
            coordinates: [76.77052, 30.73536],
          address: 'Sector 17-C, Chandigarh, 160017'
          },
          description: 'Planned city center parking',
          totalSlots: 100,
          availableSlots: 22,
          hourlyRate: 45,
          operator: 'Chandigarh Parking Authority',
          status: 'active',
          amenities: ['Covered', 'Security', 'Valet Service', 'Electric Vehicle Charging']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlotsByZone = async (zoneId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/parking/slots/${zoneId}`);
      // Ensure response.data is an array
      setSlots(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching parking slots');
      console.error('Error fetching slots:', err);
      
      // Demo data for parking slots
      setSlots([
        {
          _id: 'slot1',
          slotNumber: 'A-01',
          zone: zoneId,
          status: 'available',
          type: 'Compact',
          width: 2.5,
          length: 5.0,
          features: ['Covered', 'Security'],
          isReserved: false,
          currentVehicle: undefined
        },
        {
          _id: 'slot2',
          slotNumber: 'A-02',
          zone: zoneId,
          status: 'available',
          type: 'Compact',
          width: 2.5,
          length: 5.0,
          features: ['Covered', 'Security'],
          isReserved: false,
          currentVehicle: undefined
        },
        {
          _id: 'slot3',
          slotNumber: 'A-03',
          zone: zoneId,
          status: 'occupied',
          type: 'Compact',
          width: 2.5,
          length: 5.0,
          features: ['Covered', 'Security'],
          isReserved: false,
          currentVehicle: {
            licensePlate: 'DL01AB1234',
            entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
          }
        },
        {
          _id: 'slot4',
          slotNumber: 'B-01',
          zone: zoneId,
          status: 'reserved',
          type: 'Large',
          width: 3.0,
          length: 6.0,
          features: ['Covered', 'Security', 'EV Charging'],
          isReserved: true,
          reservedBy: 'user123',
          reservationStartTime: new Date(Date.now() + 30 * 60 * 1000), // 30 mins from now
          reservationEndTime: new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours from now
        },
        {
          _id: 'slot5',
          slotNumber: 'B-02',
          zone: zoneId,
          status: 'available',
          type: 'Large',
          width: 3.0,
          length: 6.0,
          features: ['Covered', 'Security', 'EV Charging'],
          isReserved: false,
          currentVehicle: undefined
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (
    slotId: string, 
    startTime: Date, 
    endTime: Date, 
    licensePlate: string
  ): Promise<Reservation | null> => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/parking/reserve`, 
        { slotId, startTime, endTime, licensePlate }
      );
      
      setReservations(prev => [...prev, response.data]);
      setError(null);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating reservation');
      console.error('Error creating reservation:', err);
      
      // Demo reservation data
      const demoReservation: Reservation = {
        _id: `res_${Date.now()}`,
        user: 'demoUser123',
        slot: slotId,
        zone: 'zone1',
        startTime,
        endTime,
        status: 'confirmed',
        licensePlate,
        totalCost: 150, // 3 hours at ₹50/hour
        paymentStatus: 'pending',
        createdAt: new Date()
      };
      
      setReservations(prev => [...prev, demoReservation]);
      return demoReservation;
    } finally {
      setLoading(false);
    }
  };

  const releaseSlot = async (reservationId: string) => {
    try {
      setLoading(true);
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/parking/release`, { reservationId });
      
      setReservations(prev => 
        prev.map(res => 
          res._id === reservationId ? { ...res, status: 'completed' } : res
        )
      );
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error releasing slot');
      console.error('Error releasing slot:', err);
      
      // Update reservation status in demo mode
      setReservations(prev => 
        prev.map(res => 
          res._id === reservationId ? { ...res, status: 'completed', actualExitTime: new Date() } : res
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const value = {
    zones,
    slots,
    reservations,
    selectedZone,
    setSelectedZone,
    loading,
    error,
    fetchZones,
    fetchSlotsByZone,
    createReservation,
    releaseSlot,
    socket
  };

  return (
    <ParkingContext.Provider value={value}>
      {children}
    </ParkingContext.Provider>
  );
};