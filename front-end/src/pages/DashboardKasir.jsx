import React from 'react';
import '../styles/Dashboard.css';
import Sidebar from '../components/Sidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardKasir = ({ onLogout }) => {
  // Sample data for hourly sales chart
  const hourlySalesData = [
    { name: '08:00', penjualan: 120000 },
    { name: '09:00', penjualan: 180000 },
    { name: '10:00', penjualan: 250000 },
    { name: '11:00', penjualan: 320000 },
    { name: '12:00', penjualan: 400000 },
    { name: '13:00', penjualan: 280000 },
    { name: '14:00', penjualan: 220000 },
    { name: '15:00', penjualan: 180000 },
    { name: '16:00', penjualan: 230000 },
  ];

  // Format currency to Rupiah
  const formatToRupiah = (value) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={onLogout} />
      
      <div className="main-content">
        <div className="header">
          <h1>Dashboard Kasir</h1>
          <div className="user-info">
            <span className="date">12 May 2025, 07:41:55</span>
            <div className="admin-profile">
              <span>Kasir</span>
              <div className="profile-image">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Penjualan Hari Ini</span>
              <h2 className="stat-value">Rp 2.000.000</h2>
              <span className="stat-change">+12% dari kemarin</span>
            </div>
            <div className="stat-icon transaction-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M3,6H21V18H3V6M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z" />
              </svg>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Jumlah Transaksi</span>
              <h2 className="stat-value">18</h2>
              <span className="stat-change">transaksi hari ini</span>
            </div>
            <div className="stat-icon medicine-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7Z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="chart-section full-width">
          <h2>Grafik Penjualan Per Jam</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={hourlySalesData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatToRupiah} />
                <Tooltip formatter={(value) => formatToRupiah(value)} />
                <Area type="monotone" dataKey="penjualan" name="Penjualan" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="table-section full-width">
          <h2>Transaksi Terakhir</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Waktu</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#TRX-001</td>
                <td>10:45</td>
                <td>Rp 150.000</td>
                <td><span className="status-badge completed">Selesai</span></td>
              </tr>
              <tr>
                <td>#TRX-002</td>
                <td>11:20</td>
                <td>Rp 75.000</td>
                <td><span className="status-badge completed">Selesai</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardKasir;
