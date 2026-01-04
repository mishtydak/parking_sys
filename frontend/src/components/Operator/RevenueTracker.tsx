import React, { useState, useEffect } from 'react';
import { useParking } from '../../context/ParkingContext';
import '../../styles/operator.css';

const RevenueTracker: React.FC = () => {
  const { reservations } = useParking();
  const [revenueData, setRevenueData] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0
  });
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    // Calculate revenue based on reservations
    calculateRevenue();
  }, [reservations]);

  const calculateRevenue = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    let todayRevenue = 0;
    let weekRevenue = 0;
    let monthRevenue = 0;
    let totalRevenue = 0;

    reservations.forEach(res => {
      if (res.paymentStatus === 'paid') {
        const resDate = new Date(res.createdAt);
        
        // Add to total
        totalRevenue += res.totalCost;
        
        // Check if it's from today
        if (resDate >= today) {
          todayRevenue += res.totalCost;
        }
        
        // Check if it's from this week
        if (resDate >= oneWeekAgo) {
          weekRevenue += res.totalCost;
        }
        
        // Check if it's from this month
        if (resDate >= oneMonthAgo) {
          monthRevenue += res.totalCost;
        }
      }
    });

    setRevenueData({
      today: parseFloat(todayRevenue.toFixed(2)),
      thisWeek: parseFloat(weekRevenue.toFixed(2)),
      thisMonth: parseFloat(monthRevenue.toFixed(2)),
      total: parseFloat(totalRevenue.toFixed(2))
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="revenue-tracker">
      <h2>Revenue Tracker</h2>
      
      <div className="revenue-stats">
        <div className="revenue-card">
          <h3>Today</h3>
          <p className="revenue-amount">{formatCurrency(revenueData.today)}</p>
        </div>
        <div className="revenue-card">
          <h3>This Week</h3>
          <p className="revenue-amount">{formatCurrency(revenueData.thisWeek)}</p>
        </div>
        <div className="revenue-card">
          <h3>This Month</h3>
          <p className="revenue-amount">{formatCurrency(revenueData.thisMonth)}</p>
        </div>
        <div className="revenue-card">
          <h3>Total Revenue</h3>
          <p className="revenue-amount">{formatCurrency(revenueData.total)}</p>
        </div>
      </div>
      
      <div className="revenue-chart">
        <h3>Revenue Overview</h3>
        <div className="chart-container">
          <div className="chart-bar">
            <div 
              className="bar-item"
              style={{ height: `${revenueData.today > 0 ? Math.min(100, (revenueData.today / Math.max(revenueData.thisWeek, revenueData.thisMonth, revenueData.total)) * 100) : 0}%` }}
            >
              <span>{formatCurrency(revenueData.today)}</span>
            </div>
            <div className="bar-label">Today</div>
          </div>
          <div className="chart-bar">
            <div 
              className="bar-item"
              style={{ height: `${revenueData.thisWeek > 0 ? Math.min(100, (revenueData.thisWeek / Math.max(revenueData.thisMonth, revenueData.total)) * 100) : 0}%` }}
            >
              <span>{formatCurrency(revenueData.thisWeek)}</span>
            </div>
            <div className="bar-label">Week</div>
          </div>
          <div className="chart-bar">
            <div 
              className="bar-item"
              style={{ height: `${revenueData.thisMonth > 0 ? Math.min(100, (revenueData.thisMonth / revenueData.total) * 100) : 0}%` }}
            >
              <span>{formatCurrency(revenueData.thisMonth)}</span>
            </div>
            <div className="bar-label">Month</div>
          </div>
          <div className="chart-bar">
            <div 
              className="bar-item"
              style={{ height: '100%' }}
            >
              <span>{formatCurrency(revenueData.total)}</span>
            </div>
            <div className="bar-label">Total</div>
          </div>
        </div>
      </div>
      
      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>License Plate</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations
              .filter(res => res.paymentStatus === 'paid')
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map(res => (
                <tr key={res._id}>
                  <td>{new Date(res.createdAt).toLocaleDateString()}</td>
                  <td>{res.licensePlate}</td>
                  <td>{formatCurrency(res.totalCost)}</td>
                  <td className={`status-${res.paymentStatus}`}>{res.paymentStatus}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueTracker;