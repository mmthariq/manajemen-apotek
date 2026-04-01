import React from 'react';
import Sidebar from './Sidebar';
import '../styles/DashboardLayout.css';

const DashboardLayout = ({ onLogout, userRole, currentUser, children }) => {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-layout-sidebar">
        <Sidebar onLogout={onLogout} userRole={userRole} currentUser={currentUser} />
      </aside>
      <main className="dashboard-layout-main">{children}</main>
    </div>
  );
};

export default DashboardLayout;
