import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    
    if (onLogout) {
      onLogout();
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Apotek Pemuda Farma</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li className={currentPath === '/dashboard' ? 'active' : ''}>
            <Link to="/dashboard">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z" />
              </svg>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className={currentPath === '/dashboard-kasir' ? 'active' : ''}>
            <Link to="/dashboard-kasir">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19.5,3.5L18,2L16.5,3.5L15,2L13.5,3.5L12,2L10.5,3.5L9,2L7.5,3.5L6,2L4.5,3.5L3,2V22L4.5,20.5L6,22L7.5,20.5L9,22L10.5,20.5L12,22L13.5,20.5L15,22L16.5,20.5L18,22L19.5,20.5L21,22V2L19.5,3.5M9,17H7V15H9V17M9,13H7V11H9V13M9,9H7V7H9V9M13,17H11V15H13V17M13,13H11V11H13V13M13,9H11V7H13V9Z" />
              </svg>
              <span>Dashboard Kasir</span>
            </Link>
          </li>
          <li className={currentPath === '/manajemen-stok' ? 'active' : ''}>
            <Link to="/manajemen-stok">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H15V4H19M7,2H3V4H7M21,11H3V13H21M21,16H3V18H21" />
              </svg>
              <span>Manajemen Stok Obat</span>
            </Link>
          </li>
          <li className={currentPath === '/transaksi' ? 'active' : ''}>
            <Link to="/transaksi">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M5,6H23V18H5V6M14,9A3,3 0 0,1 17,12A3,3 0 0,1 14,15A3,3 0 0,1 11,12A3,3 0 0,1 14,9M9,8A2,2 0 0,1 7,10V14A2,2 0 0,1 9,16H19A2,2 0 0,1 21,14V10A2,2 0 0,1 19,8H9M1,10H3V20H19V22H1V10Z" />
              </svg>
              <span>Transaksi Penjualan</span>
            </Link>
          </li>
          <li className={currentPath === '/transaksi-kasir' ? 'active' : ''}>
            <Link to="/transaksi-kasir">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z" />
              </svg>
              <span>Transaksi Kasir</span>
            </Link>
          </li>
          <li className={currentPath === '/laporan-kasir' ? 'active' : ''}>
            <Link to="/laporan-kasir">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M14,2H6C4.89,2 4,2.89 4,4V20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20V8L14,2M18,20H6V4H13V9H18V20M10,13H8V11H10V13M10,17H8V15H10V17M14,13H12V11H14V13M14,17H12V15H14V17Z" />
              </svg>
              <span>Laporan Penjualan</span>
            </Link>
          </li>
          <li className={currentPath === '/supplier' ? 'active' : ''}>
            <Link to="/supplier">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M20,17A2,2 0 0,0 22,15V4A2,2 0 0,0 20,2H9.46C9.81,2.61 10,3.3 10,4H20V15H11V17M15,7V9H9V22H7V16H5V22H3V14H1.5V9A2,2 0 0,1 3.5,7H15M8,4A2,2 0 0,1 6,6A2,2 0 0,1 4,4A2,2 0 0,1 6,2A2,2 0 0,1 8,4Z" />
              </svg>
              <span>Supplier</span>
            </Link>
          </li>
          <li className={currentPath === '/manajemen-pengguna' ? 'active' : ''}>
            <Link to="/manajemen-pengguna">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z" />
              </svg>
              <span>Manajemen Pengguna</span>
            </Link>
          </li>
          <li className={currentPath === '/laporan' ? 'active' : ''}>
            <Link to="/laporan">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z" />
              </svg>
              <span>Laporan Analitik</span>
            </Link>
          </li>
          <li className="logout" onClick={handleLogout}>
            <div className="logout-link">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
              </svg>
              <span className="logout-text">Logout</span>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 