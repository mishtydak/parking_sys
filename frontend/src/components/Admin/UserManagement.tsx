import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/admin.css';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'driver',
    licensePlate: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Reset form and refetch users
      setFormData({ name: '', email: '', role: 'driver', licensePlate: '' });
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        fetchUsers(); // Refresh the list
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error deleting user');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (!window.confirm(`Delete ${selectedUsers.length} selected user(s)?`)) return;

    try {
      for (const id of selectedUsers) {
        await axios.delete(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${id}`,
          {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }
        );
      }
      setSelectedUsers([]);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting users');
    }
  };

  const toggleSelect = (userId: string, checked: boolean) => {
    setSelectedUsers(prev => checked ? [...prev, userId] : prev.filter(id => id !== userId));
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating user role');
    }
  };

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>User Management</h2>
        <div className="management-actions">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add User'}
          </button>
          <button
            className="btn-danger"
            onClick={handleBulkDelete}
            disabled={selectedUsers.length === 0}
            style={{ marginLeft: '8px' }}
          >
            Delete Selected
          </button>
        </div>
      </div>

      {showForm && (
        <form className="user-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
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
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="driver">Driver</option>
              <option value="operator">Parking Operator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="licensePlate">License Plate:</label>
            <input
              type="text"
              id="licensePlate"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
            />
          </div>
          
          <button type="submit" className="btn-primary">Create User</button>
        </form>
      )}

      {error && <div className="error">{error}</div>}

      <div className="users-list">
        <h3>All Users</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>License Plate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={(e) => toggleSelect(user._id, e.target.checked)}
                    />
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    >
                      <option value="driver">Driver</option>
                      <option value="operator">Operator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{user.licensePlate || '-'}</td>
                  <td>
                    <button 
                      className="btn-danger" 
                      onClick={() => handleDelete(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;