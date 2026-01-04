import React, { useState, useEffect } from 'react';
import '../../styles/admin.css';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    maxReservationHours: 24,
    minReservationHours: 1,
    cancellationWindow: 2, // hours before start time
    reminderTime: 30, // minutes before expiry
    currency: 'USD',
    defaultHourlyRate: 2.00,
    enableNotifications: true,
    enableAutoRelease: true
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // In a real app, we would fetch settings from the API
    // For this demo, we'll use default values
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : type === 'number' 
        ? Number(value) 
        : value;
    
    setSettings(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      // In a real app, we would save settings to the API
      // For this demo, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="system-settings">
      <h2>System Settings</h2>
      
      {message && <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="settings-section">
          <h3>Reservation Settings</h3>
          
          <div className="form-group">
            <label htmlFor="maxReservationHours">Maximum Reservation Hours:</label>
            <input
              type="number"
              id="maxReservationHours"
              name="maxReservationHours"
              value={settings.maxReservationHours}
              onChange={handleChange}
              min="1"
              max="168" // 1 week
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="minReservationHours">Minimum Reservation Hours:</label>
            <input
              type="number"
              id="minReservationHours"
              name="minReservationHours"
              value={settings.minReservationHours}
              onChange={handleChange}
              min="0.5"
              step="0.5"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="cancellationWindow">Cancellation Window (hours):</label>
            <input
              type="number"
              id="cancellationWindow"
              name="cancellationWindow"
              value={settings.cancellationWindow}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Notification Settings</h3>
          
          <div className="form-group">
            <label htmlFor="reminderTime">Reminder Time (minutes before expiry):</label>
            <input
              type="number"
              id="reminderTime"
              name="reminderTime"
              value={settings.reminderTime}
              onChange={handleChange}
              min="1"
            />
          </div>
          
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="enableNotifications"
              name="enableNotifications"
              checked={settings.enableNotifications}
              onChange={handleChange}
            />
            <label htmlFor="enableNotifications">Enable Notifications</label>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Payment Settings</h3>
          
          <div className="form-group">
            <label htmlFor="currency">Currency:</label>
            <select
              id="currency"
              name="currency"
              value={settings.currency}
              onChange={handleChange}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="defaultHourlyRate">Default Hourly Rate:</label>
            <input
              type="number"
              id="defaultHourlyRate"
              name="defaultHourlyRate"
              value={settings.defaultHourlyRate}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="settings-section">
          <h3>System Settings</h3>
          
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="enableAutoRelease"
              name="enableAutoRelease"
              checked={settings.enableAutoRelease}
              onChange={handleChange}
            />
            <label htmlFor="enableAutoRelease">Enable Auto Release</label>
          </div>
        </div>
        
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default SystemSettings;