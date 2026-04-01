import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import DashboardLayout from '../components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const API_BASE_URL = 'http://localhost:3000/api/dashboard/analytics';

const Dashboard = ({ onLogout, userRole, currentUser }) => {
  const [weeklySalesData, setWeeklySalesData] = useState([]);
  const [medicineCategoryData, setMedicineCategoryData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalObat: 0,
    transaksiHariIni: 0,
    totalSupplier: 0,
    totalPengguna: 0,
  });
  const [errorMessage, setErrorMessage] = useState('');

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Format currency to Rupiah
  const formatToRupiah = (value) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setErrorMessage('');
        const response = await fetch(API_BASE_URL);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Gagal memuat dashboard.');
        }

        const data = result.data || {};
        setWeeklySalesData(Array.isArray(data.weeklySales) ? data.weeklySales : []);
        setMedicineCategoryData(Array.isArray(data.categories) ? data.categories : []);
        setLowStockProducts(Array.isArray(data.lowStockProducts) ? data.lowStockProducts.slice(0, 5) : []);
        setRecentTransactions(Array.isArray(data.recentTransactions) ? data.recentTransactions.slice(0, 5) : []);
        setSummaryData(data.summary || {
          totalObat: 0,
          transaksiHariIni: 0,
          totalSupplier: 0,
          totalPengguna: 0,
        });
      } catch (error) {
        setErrorMessage(error.message || 'Terjadi kesalahan saat memuat dashboard.');
      }
    };

    fetchAnalytics();
  }, []);

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${payload[0].name} : ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout onLogout={onLogout} userRole={userRole} currentUser={currentUser}>
      <div className="main-content">
        <div className="header">
          <h1>Dashboard</h1>
          <div className="user-info">
            <span className="date">12 May 2025, 07:41:55</span>
            <div className="admin-profile">
              <span>Admin</span>
              <div className="profile-image">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stats-container">
          {errorMessage && <p>{errorMessage}</p>}
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Total Obat</span>
              <h2 className="stat-value">{summaryData.totalObat}</h2>
            </div>
            <div className="stat-icon medicine-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M6,3A3,3 0 0,1 9,6C9,7.31 8.17,8.42 7,8.83V15.17C8.17,15.58 9,16.69 9,18A3,3 0 0,1 6,21A3,3 0 0,1 3,18C3,16.69 3.83,15.58 5,15.17V8.83C3.83,8.42 3,7.31 3,6A3,3 0 0,1 6,3M6,5A1,1 0 0,0 5,6A1,1 0 0,0 6,7A1,1 0 0,0 7,6A1,1 0 0,0 6,5M6,17A1,1 0 0,0 5,18A1,1 0 0,0 6,19A1,1 0 0,0 7,18A1,1 0 0,0 6,17M21,18A3,3 0 0,1 18,21A3,3 0 0,1 15,18C15,16.69 15.83,15.58 17,15.17V7H15V10.25L10.75,6L15,1.75V5H17A2,2 0 0,1 19,7V15.17C20.17,15.58 21,16.69 21,18M18,17A1,1 0 0,0 17,18A1,1 0 0,0 18,19A1,1 0 0,0 19,18A1,1 0 0,0 18,17Z" />
              </svg>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Transaksi Hari Ini</span>
              <h2 className="stat-value">{summaryData.transaksiHariIni}</h2>
            </div>
            <div className="stat-icon transaction-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M5,6H23V18H5V6M14,9A3,3 0 0,1 17,12A3,3 0 0,1 14,15A3,3 0 0,1 11,12A3,3 0 0,1 14,9M9,8A2,2 0 0,1 7,10V14A2,2 0 0,1 9,16H19A2,2 0 0,1 21,14V10A2,2 0 0,1 19,8H9M1,10H3V20H19V22H1V10Z" />
              </svg>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Total Supplier</span>
              <h2 className="stat-value">{summaryData.totalSupplier}</h2>
            </div>
            <div className="stat-icon supplier-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M20,17A2,2 0 0,0 22,15V4A2,2 0 0,0 20,2H9.46C9.81,2.61 10,3.3 10,4H20V15H11V17M15,7V9H9V22H7V16H5V22H3V14H1.5V9A2,2 0 0,1 3.5,7H15M8,4A2,2 0 0,1 6,6A2,2 0 0,1 4,4A2,2 0 0,1 6,2A2,2 0 0,1 8,4Z" />
              </svg>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Total Pengguna</span>
              <h2 className="stat-value">{summaryData.totalPengguna}</h2>
            </div>
            <div className="stat-icon user-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="charts-row">
          <div className="chart-section">
            <h2>Grafik Penjualan Mingguan</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={weeklySalesData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatToRupiah} />
                  <Tooltip formatter={(value) => formatToRupiah(value)} />
                  <Legend />
                  <Bar dataKey="penjualan" name="Penjualan" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="chart-section">
            <h2>Kategori Obat</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={medicineCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {medicineCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="tables-container">
          <div className="table-section">
            <h2>Obat Hampir Habis</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Obat</th>
                  <th>Stok</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="table-section">
            <h2>Transaksi Terbaru</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pembeli</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.customerName}</td>
                    <td>{formatToRupiah(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 