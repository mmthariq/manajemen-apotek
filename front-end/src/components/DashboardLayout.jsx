import React, { useState } from 'react';
import Sidebar from './Sidebar';
import '../styles/DashboardLayout.css';

const DashboardLayout = ({ onLogout, userRole, currentUser, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-layout-sidebar">
        <Sidebar
          onLogout={onLogout}
          userRole={userRole}
          currentUser={currentUser}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>
      <main className="dashboard-layout-main">
        {typeof children === 'function'
          ? children({ toggleSidebar: () => setSidebarOpen(prev => !prev) })
          : children}
      </main>
    </div>
  );
};

export default DashboardLayout;
