import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import NotificationBell from '../NotificationBell';
import useRealtimeClock from '../../hooks/useRealtimeClock';
import './DashboardHeader.css';

const ROLE_LABELS = {
  admin: 'Admin',
  kasir: 'Kasir',
  owner: 'Owner',
  staff: 'Staff',
};

const HEADER_TITLES = {
  admin: [
    { title: 'Dashboard', match: (path) => path === '/dashboard' },
    { title: 'Manajemen Stok Obat', match: (path) => path === '/manajemen-stok' },
    { title: 'Manajemen Obat Racikan', match: (path) => path === '/manajemen-obat-racikan' },
    { title: 'Transaksi Penjualan', match: (path) => path === '/transaksi' },
    { title: 'Supplier', match: (path) => path === '/supplier' },
    { title: 'Manajemen Pengadaan', match: (path) => path === '/pengadaan' },
    { title: 'Manajemen Pengguna', match: (path) => path === '/manajemen-pengguna' },
    { title: 'Laporan Analitik', match: (path) => path === '/laporan' },
  ],
  kasir: [
    {
      title: 'Verifikasi Pembayaran',
      match: (path, tab) => path === '/dashboard-kasir' && tab === 'verification',
    },
    { title: 'Dashboard Kasir', match: (path) => path === '/dashboard-kasir' },
    { title: 'Transaksi', match: (path) => path === '/transaksi-kasir' },
    { title: 'Pengadaan', match: (path) => path === '/pengadaan' },
    { title: 'Laporan Penjualan', match: (path) => path === '/laporan-kasir' },
  ],
  owner: [
    { title: 'Dashboard Analitik', match: (path) => path === '/laporan' },
  ],
};

const resolveHeaderTitle = (roleKey, location) => {
  const path = location.pathname;
  const tab = new URLSearchParams(location.search).get('tab') || '';
  const entries = HEADER_TITLES[roleKey] || [];
  const matched = entries.find((entry) => entry.match(path, tab));
  return matched?.title || 'Dashboard';
};

const DashboardHeader = ({ userRole = 'admin', authToken = null }) => {
  const location = useLocation();
  const clock = useRealtimeClock();
  const roleKey = String(userRole || 'admin').toLowerCase();

  if (roleKey === 'customer') {
    return null;
  }

  const title = useMemo(
    () => resolveHeaderTitle(roleKey, location),
    [roleKey, location]
  );

  const roleLabel = ROLE_LABELS[roleKey] || 'Admin';

  return (
    <div className="dashboard-header">
      <h1>{title}</h1>
      <div className="user-info">
        <span className="date">{clock}</span>
        <NotificationBell authToken={authToken} />
        <div className="admin-profile">
          <span>{roleLabel}</span>
          <div className="profile-image">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
