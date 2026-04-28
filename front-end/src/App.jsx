import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom'
import './App.css'
import './styles/common.css'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ManajemenStok from './pages/ManajemenStok'
import TransaksiPenjualan from './pages/TransaksiPenjualan'
import SupplierPage from './pages/SupplierPage'
import ManajemenPengguna from './pages/ManajemenPengguna'
import LaporanAnalitik from './pages/LaporanAnalitik'
import ManajemenPengadaan from './pages/ManajemenPengadaan'
import DashboardKasir from './pages/DashboardKasir'
import TransaksiKasir from './pages/TransaksiForm'
import LaporanPenjualanKasir from './pages/LaporanPenjualanKasir'
import CustomerRegistration from './pages/CustomerRegistration'
import CustomerLoginPage from './pages/CustomerLoginPage'
import CustomerDashboard from './pages/CustomerDashboard'
import ManajemenObatRacikan from './pages/ManajemenObatRacikan'
import OrderSuccess from './pages/OrderSuccess'

function App() {
  const [authToken, setAuthToken] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const normalizeRole = (role) => String(role || '').trim().toLowerCase()
  const isAuthenticated = Boolean(authToken && userRole)

  const handleLogin = (token, role, userData = null) => {
    const normalizedRole = normalizeRole(role)
    setAuthToken(token)
    setUserRole(normalizedRole)
    setCurrentUser(userData || null)
  }

  const handleLogout = async () => {
    if (authToken) {
      try {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
      } catch (error) {
        // Logout lokal tetap dijalankan walau request logout gagal.
      }
    }

    setAuthToken(null)
    setUserRole(null)
    setCurrentUser(null)
  }

  const getRedirectPath = () => {
    if (!userRole) return '/login';
    switch (userRole) {
      case 'admin':
        return '/dashboard';
      case 'kasir':
        return '/dashboard-kasir';
      case 'owner':
        return '/laporan';
      case 'customer':
        return '/customer-dashboard';
      default:
        return '/login';
    }
  };

  const hasRole = (allowedRoles) => isAuthenticated && allowedRoles.includes(userRole)

  const OrderDetailRedirect = () => {
    const { orderId } = useParams()
    const target = orderId
      ? `/customer-dashboard?tab=history&detail=${orderId}`
      : '/customer-dashboard?tab=history'
    return <Navigate to={target} replace />
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={
            <LandingPage isAuthenticated={isAuthenticated} redirectPath={getRedirectPath()} />
          } />
          <Route path="/login" element={
            isAuthenticated ?
              <Navigate to={getRedirectPath()} /> :
              <LoginPage onLogin={handleLogin} />
          } />
          <Route path="/customer-login" element={
            isAuthenticated && userRole === 'customer' ?
              <Navigate to="/customer-dashboard" /> :
              isAuthenticated ?
                <Navigate to={getRedirectPath()} /> :
                <CustomerLoginPage onLogin={handleLogin} />
          } />
          <Route path="/customer-dashboard" element={
            isAuthenticated && userRole === 'customer' ? 
              <CustomerDashboard
                onLogout={handleLogout}
                authToken={authToken}
                currentUser={currentUser}
                onUserUpdate={setCurrentUser}
              /> : 
              <Navigate to="/login" />
          } />
          <Route path="/order-success" element={
            isAuthenticated && userRole === 'customer' ?
              <OrderSuccess /> :
              <Navigate to="/login" />
          } />
          <Route path="/orders/:orderId" element={
            isAuthenticated && userRole === 'customer' ?
              <OrderDetailRedirect /> :
              <Navigate to="/login" />
          } />
          <Route path="/dashboard" element={
            hasRole(['admin']) ?
              <Dashboard onLogout={handleLogout} userRole={userRole} currentUser={currentUser} authToken={authToken} /> :
              <Navigate to={isAuthenticated ? getRedirectPath() : '/login'} />
          } />
          <Route path="/dashboard-kasir" element={
            hasRole(['kasir']) ?
              <DashboardKasir onLogout={handleLogout} userRole={userRole} currentUser={currentUser} authToken={authToken} /> :
              <Navigate to={isAuthenticated ? getRedirectPath() : '/login'} />
          } />
          <Route path="/manajemen-stok" element={
            hasRole(['admin']) ? 
              <ManajemenStok onLogout={handleLogout} authToken={authToken} /> : 
              <Navigate to={isAuthenticated ? getRedirectPath() : '/login'} />
          } />
          <Route path="/manajemen-obat-racikan" element={
            hasRole(['admin']) ? 
              <ManajemenObatRacikan onLogout={handleLogout} authToken={authToken} /> : 
              <Navigate to={isAuthenticated ? getRedirectPath() : '/login'} />
          } />
          <Route path="/transaksi" element={
            hasRole(['admin']) ? 
              <TransaksiPenjualan onLogout={handleLogout} authToken={authToken} /> : 
              <Navigate to={isAuthenticated ? getRedirectPath() : '/login'} />
          } />
          <Route path="/transaksi-kasir" element={
            hasRole(['kasir']) ? 
              <TransaksiKasir onLogout={handleLogout} userRole={userRole} currentUser={currentUser} authToken={authToken} /> : 
              <Navigate to={isAuthenticated ? getRedirectPath() : '/login'} />
          } />
          <Route path="/laporan-kasir" element={
            hasRole(['kasir']) ? 
              <LaporanPenjualanKasir onLogout={handleLogout} userRole={userRole} currentUser={currentUser} authToken={authToken} /> : 
              <Navigate to={isAuthenticated ? getRedirectPath() : '/login'} />
          } />
          <Route path="/supplier" element={
            hasRole(['admin']) ? 
              <SupplierPage onLogout={handleLogout} authToken={authToken} /> : 
              <Navigate to={isAuthenticated ? getRedirectPath() : '/login'} />
          } />
          <Route path="/pengadaan" element={
            hasRole(['admin', 'kasir']) ?
              <ManajemenPengadaan onLogout={handleLogout} userRole={userRole} currentUser={currentUser} authToken={authToken} /> :
              <Navigate to={isAuthenticated ? getRedirectPath() : '/login'} />
          } />
          <Route path="/manajemen-pengguna" element={
            hasRole(['admin']) ? 
              <ManajemenPengguna onLogout={handleLogout} authToken={authToken} /> : 
              <Navigate to={isAuthenticated ? getRedirectPath() : '/login'} />
          } />
          <Route path="/laporan" element={
            hasRole(['admin', 'owner']) ? 
              <LaporanAnalitik onLogout={handleLogout} userRole={userRole} currentUser={currentUser} authToken={authToken} /> : 
              <Navigate to={isAuthenticated ? getRedirectPath() : '/login'} />
          } />
          {/* Customer Routes */}
          <Route path="/register-customer" element={
            <CustomerRegistration />
          } />
          {/* Add more routes for other pages as needed */}
        </Routes>
      </div>
    </Router>
  )
}

export default App
