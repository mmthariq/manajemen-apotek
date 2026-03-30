import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import './styles/common.css'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ManajemenStok from './pages/ManajemenStok'
import TransaksiPenjualan from './pages/TransaksiPenjualan'
import SupplierPage from './pages/SupplierPage'
import ManajemenPengguna from './pages/ManajemenPengguna'
import LaporanAnalitik from './pages/LaporanAnalitik'
import DashboardKasir from './pages/DashboardKasir'
import TransaksiKasir from './pages/TransaksiForm'
import LaporanPenjualanKasir from './pages/LaporanPenjualanKasir'
import CustomerRegistration from './pages/CustomerRegistration'
import CustomerDashboard from './pages/CustomerDashboard'
import ManajemenObatRacikan from './pages/ManajemenObatRacikan'
import OrderSuccess from './pages/OrderSuccess'
import OrderDetail from './pages/OrderDetail'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const normalizeRole = (role) => String(role || '').toLowerCase()

  // Check for token and role in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = normalizeRole(localStorage.getItem('role'))
    if (token && role) {
      setIsAuthenticated(true)
      setUserRole(role)
    }
  }, [])

  const handleLogin = (token, role, userData = null) => {
    const normalizedRole = normalizeRole(role)
    localStorage.setItem('token', token);
    localStorage.setItem('role', normalizedRole);
    if (normalizedRole === 'customer' && userData) {
      localStorage.setItem('customerData', JSON.stringify(userData));
    }
    setIsAuthenticated(true);
    setUserRole(normalizedRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    setIsAuthenticated(false)
    setUserRole(null)
  }

  const getRedirectPath = () => {
    if (!userRole) return "/";
    switch (userRole) {
      case 'admin':
        return '/dashboard';
      case 'kasir':
        return '/dashboard-kasir';
      case 'customer':
        return '/customer-dashboard';
      default:
        return '/';
    }
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={
            isAuthenticated ? 
              <Navigate to={getRedirectPath()} /> : 
              <LoginPage onLogin={handleLogin} />
          } />
          <Route path="/customer-dashboard" element={
            isAuthenticated && userRole === 'customer' ? 
              <CustomerDashboard onLogout={handleLogout} /> : 
              <Navigate to="/" />
          } />
          <Route path="/order-success" element={
            isAuthenticated && userRole === 'customer' ?
              <OrderSuccess /> :
              <Navigate to="/" />
          } />
          <Route path="/orders/:orderId" element={
            isAuthenticated && userRole === 'customer' ?
              <OrderDetail /> :
              <Navigate to="/" />
          } />
          <Route path="/dashboard" element={
            isAuthenticated ? 
              <Dashboard onLogout={handleLogout} /> : 
              <Navigate to="/" />
          } />
          <Route path="/dashboard-kasir" element={
            isAuthenticated ? 
              <DashboardKasir onLogout={handleLogout} /> : 
              <Navigate to="/" />
          } />
          <Route path="/manajemen-stok" element={
            isAuthenticated ? 
              <ManajemenStok onLogout={handleLogout} /> : 
              <Navigate to="/" />
          } />
          <Route path="/manajemen-obat-racikan" element={
            isAuthenticated ? 
              <ManajemenObatRacikan onLogout={handleLogout} /> : 
              <Navigate to="/" />
          } />
          <Route path="/transaksi" element={
            isAuthenticated ? 
              <TransaksiPenjualan onLogout={handleLogout} /> : 
              <Navigate to="/" />
          } />
          <Route path="/transaksi-kasir" element={
            isAuthenticated ? 
              <TransaksiKasir onLogout={handleLogout} /> : 
              <Navigate to="/" />
          } />
          <Route path="/laporan-kasir" element={
            isAuthenticated ? 
              <LaporanPenjualanKasir onLogout={handleLogout} /> : 
              <Navigate to="/" />
          } />
          <Route path="/supplier" element={
            isAuthenticated ? 
              <SupplierPage onLogout={handleLogout} /> : 
              <Navigate to="/" />
          } />
          <Route path="/manajemen-pengguna" element={
            isAuthenticated ? 
              <ManajemenPengguna onLogout={handleLogout} /> : 
              <Navigate to="/" />
          } />
          <Route path="/laporan" element={
            isAuthenticated ? 
              <LaporanAnalitik onLogout={handleLogout} /> : 
              <Navigate to="/" />
          } />
          {/* Customer Routes */}
          <Route path="/register-customer" element={
            <CustomerRegistration onRegistrationSuccess={() => setIsAuthenticated(true)} />
          } />
          {/* Add more routes for other pages as needed */}
        </Routes>
      </div>
    </Router>
  )
}

export default App
