import React, { useEffect } from 'react';
import AnalyticsDashboard from '../../components/Admin/AnalyticsDashboard';
import { useParking } from '../../context/ParkingContext';

const AnalyticsPage: React.FC = () => {
  const { fetchZones, zones, fetchSlotsByZone, setSelectedZone } = useParking();

  useEffect(() => {
    // Load zones from backend
    fetchZones();
  }, [fetchZones]);

  useEffect(() => {
    // If there are zones, select the first zone and fetch its slots
    if (zones && zones.length > 0) {
      const first = zones[0];
      setSelectedZone(first);
      fetchSlotsByZone(first._id);
    }
  }, [zones, fetchSlotsByZone, setSelectedZone]);

  return (
    <div className="admin-analytics-page">
      <AnalyticsDashboard />
    </div>
  );
};

export default AnalyticsPage;
