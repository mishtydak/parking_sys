import React from 'react';
import UserManagement from '../../components/Admin/UserManagement';
import '../../styles/admin.css';

const UsersPage: React.FC = () => {
  return (
    <div className="admin-users-page">
      <h1>Manage Users</h1>
      <UserManagement />
    </div>
  );
};

export default UsersPage;
