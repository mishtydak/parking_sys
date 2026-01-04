import React, { useState, useEffect } from 'react';
import { useParking } from '../../context/ParkingContext';
import '../../styles/admin.css';

const AnalyticsDashboard: React.FC = () => {
  const { zones, reservations, slots, fetchSlotsByZone, selectedZone, setSelectedZone } = useParking();
  const [analyticsData, setAnalyticsData] = useState({
    totalZones: 0,
    totalSlots: 0,
    totalReservations: 0,
    totalRevenue: 0,
    avgOccupancy: 0,
    topZones: [] as any[]
  });

  useEffect(() => {
    calculateAnalytics();
  }, [zones, reservations, slots]);

  const calculateAnalytics = () => {
    // Calculate total zones
    const totalZones = zones.length;

    // Calculate total slots
    const totalSlots = zones.reduce((sum, zone) => sum + zone.totalSlots, 0);

    // Calculate total reservations and revenue
    const paidReservations = reservations.filter(res => res.paymentStatus === 'paid');
    const totalReservations = reservations.length;
    const totalRevenue = paidReservations.reduce((sum, res) => sum + res.totalCost, 0);

    // Calculate average occupancy
    let totalOccupancy = 0;
    zones.forEach(zone => {
      totalOccupancy += (zone.totalSlots - zone.availableSlots) / zone.totalSlots;
    });
    const avgOccupancy = zones.length > 0 ? (totalOccupancy / zones.length) * 100 : 0;

    // Calculate top zones by revenue
    const zoneRevenueMap: Record<string, number> = {};
    paidReservations.forEach(res => {
      const zoneId = typeof res.zone === 'object' ? (res.zone as any)._id : res.zone;
      if (zoneRevenueMap[zoneId]) {
        zoneRevenueMap[zoneId] += res.totalCost;
      } else {
        zoneRevenueMap[zoneId] = res.totalCost;
      }
    });

    // Get top 5 zones by revenue
    const topZones = zones
      .map(zone => ({
        ...zone,
        revenue: zoneRevenueMap[zone._id] || 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setAnalyticsData({
      totalZones,
      totalSlots,
      totalReservations,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      avgOccupancy: parseFloat(avgOccupancy.toFixed(2)),
      topZones
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="analytics-dashboard">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <label style={{ marginRight: 8, fontWeight: 600 }}>Select Zone:</label>
        <select
          value={selectedZone?._id || ''}
          onChange={(e) => {
            const zid = e.target.value;
            const zone = zones.find(z => z._id === zid);
            if (zone) {
              setSelectedZone(zone);
              fetchSlotsByZone(zid);
            }
          }}
          style={{ padding: '6px 10px' }}
        >
          {zones.map(z => (
            <option key={z._id} value={z._id}>{z.name}</option>
          ))}
        </select>
        <div style={{ marginLeft: 16, fontWeight: 700 }}>{selectedZone?.name || ''}</div>
      </div>
      <h2>Parking Analytics Dashboard</h2>
      
      <div className="analytics-summary">
        <div className="summary-card">
          <h3>Total Zones</h3>
          <p className="summary-value">{analyticsData.totalZones}</p>
        </div>
        <div className="summary-card">
          <h3>Total Slots</h3>
          <p className="summary-value">{analyticsData.totalSlots}</p>
        </div>
        <div className="summary-card">
          <h3>Total Reservations</h3>
          <p className="summary-value">{analyticsData.totalReservations}</p>
        </div>
        <div className="summary-card">
          <h3>Total Revenue</h3>
          <p className="summary-value">{formatCurrency(analyticsData.totalRevenue)}</p>
        </div>
        <div className="summary-card">
          <h3>Avg. Occupancy</h3>
          <p className="summary-value">{analyticsData.avgOccupancy}%</p>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-container">
          <h3>Top Performing Zones by Revenue</h3>
          <div className="top-zones-list">
            {analyticsData.topZones.map((zone, index) => (
              <div key={zone._id} className="zone-item">
                <div className="zone-rank">#{index + 1}</div>
                <div className="zone-info">
                  <h4>{zone.name}</h4>
                  <p>{zone.location.address}</p>
                </div>
                <div className="zone-revenue">
                  {formatCurrency(zone.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <h3>Reservation Status Distribution</h3>
          <div className="status-distribution">
            {['reserved', 'active', 'completed', 'cancelled', 'expired'].map(status => {
              const count = reservations.filter(res => res.status === status).length;
              const percentage = reservations.length > 0 ? (count / reservations.length) * 100 : 0;
              
              return (
                <div key={status} className="status-item">
                  <div className="status-label">{status}</div>
                  <div className="status-bar">
                    <div 
                      className="status-fill" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: 
                          status === 'active' ? '#4CAF50' : 
                          status === 'reserved' ? '#2196F3' : 
                          status === 'completed' ? '#FF9800' : 
                          status === 'cancelled' ? '#F44336' : 
                          '#9E9E9E'
                      }}
                    ></div>
                  </div>
                  <div className="status-count">{count} ({percentage.toFixed(1)}%)</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <table className="activity-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Zone</th>
              <th>Slot</th>
              <th>Start Time</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {reservations
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 10)
              .map(res => {
                // res.user may be an ID string or populated object
                const userName = res.user && typeof res.user === 'object' ? ((res.user as any).name || (res.user as any).email || (res.user as any)._id) : res.user;

                // res.zone may be an ID or populated object
                const zoneId = res.zone && typeof res.zone === 'object' ? (res.zone as any)._id : res.zone;
                const zoneName = zones.find(z => z._id?.toString() === zoneId?.toString())?.name || (res.zone && typeof res.zone === 'object' ? (res.zone as any).name : 'N/A');

                // res.slot may be an ID or populated object
                const slotId = res.slot && typeof res.slot === 'object' ? (res.slot as any)._id : res.slot;
                const slotNumber = slots.find(s => s._id?.toString() === slotId?.toString())?.slotNumber || (res.slot && typeof res.slot === 'object' ? (res.slot as any).slotNumber : 'N/A');

                return (
                  <tr key={res._id}>
                    <td>{userName || 'N/A'}</td>
                    <td>{zoneName}</td>
                    <td>{slotNumber}</td>
                    <td>{res.startTime ? new Date(res.startTime).toLocaleString() : 'N/A'}</td>
                    <td className={`status-${res.status}`}>{res.status}</td>
                    <td>{formatCurrency(res.totalCost || 0)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="slots-list" style={{ marginTop: 24 }}>
        <h3>Parking Slots for {selectedZone?.name || 'Selected Zone'}</h3>
        <table className="users-table">
          <thead>
            <tr>
              <th>Slot Number</th>
              <th>Status</th>
              <th>Type</th>
              <th>Features</th>
              <th>Reserved By</th>
            </tr>
          </thead>
          <tbody>
            {slots.map(s => (
              <tr key={s._id}>
                <td>{s.slotNumber}</td>
                <td>{s.status}</td>
                <td>{s.type}</td>
                <td>{(s.features || []).join(', ')}</td>
                <td>{typeof s.reservedBy === 'object' ? s.reservedBy.name || s.reservedBy.email || s.reservedBy._id : s.reservedBy || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;