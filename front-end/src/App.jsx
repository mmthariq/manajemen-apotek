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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check for token in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (username, password) => {
    // In a real app, you would validate credentials against an API
    // For now, we'll just simulate successful login
    localStorage.setItem('token', 'dummy-token')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={
            isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <LoginPage onLogin={handleLogin} />
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
          {/* Add more routes for other pages as needed */}
        </Routes>
      </div>
    </Router>
  )
}

export default App
