import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import ForgotPasswordPage from './ForgotPasswordPage';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username atau email harus diisi';
    if (!password) newErrors.password = 'Password harus diisi';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal, silakan coba lagi.');
      }

      console.log('Login sukses:', data);
      onLogin(data.token, data.user.role, data.user);

    } catch (error) {
      setErrors({ api: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  const handleInputChange = (field) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  // Show forgot password page if requested
  if (showForgotPassword) {
    return <ForgotPasswordPage onBackToLogin={handleBackToLogin} />;
  }

  const roleDescriptions = {
    admin: {
      title: '🏢 Admin',
      desc: 'Kelola stok obat, pengguna, supplier, dan laporan lengkap',
      icon: 'M12 1C6.48 1 2 5.48 2 11s4.48 10 10 10 10-4.48 10-10S17.52 1 12 1m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 7 15.5 7 14 7.67 14 8.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 7 8.5 7 7 7.67 7 8.5 7.67 10 8.5 10zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z'
    },
    kasir: {
      title: '💳 Kasir',
      desc: 'Proses transaksi penjualan dan cetak laporan harian',
      icon: 'M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z'
    },
    customer: {
      title: '🛒 Customer',
      desc: 'Belanja obat online dengan kemudahan dan kenyamanan',
      icon: 'M7,18A1,1 0 0,0 4,15V6H20V15A1,1 0 0,0 19,16H5A1,1 0 0,0 4,15M20,4H4A2,2 0 0,0 2,6V15A2,2 0 0,0 4,17H5L7,21H17L19,17H20A2,2 0 0,0 22,15V6A2,2 0 0,0 20,4Z'
    }
  };

  return (
    <div className="login-container">
      {/* Left Section - Branding */}
      <div className="login-branding">
        <div className="branding-content">
          <div className="branding-logo">
            <svg viewBox="0 0 100 100" width="60" height="60" fill="none">
              <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="2"/>
              <path d="M30 50 L50 30 L70 50 M50 30 V70" stroke="white" strokeWidth="2.5" fill="none"/>
              <circle cx="50" cy="60" r="4" fill="white"/>
            </svg>
          </div>
          <h1 className="branding-title">Apotek Pemuda Farma</h1>
          <p className="branding-subtitle">Sistem Manajemen Apotek Modern</p>
          <div className="branding-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Manajemen Stok Cepat</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Transaksi Terpercaya</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Laporan Akurat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="login-form-section">
        <div className="login-card">
          <h2 className="login-title">Masuk</h2>
          <p className="login-subtitle">Pilih role dan masukkan kredensial Anda</p>
          
          <form onSubmit={handleLogin}>
            {/* Role Selection dengan Deskripsi */}
            <div className="form-group">
              <label className="role-label-title">Tipe Pengguna</label>
              <div className="role-selection-new">
                {Object.entries(roleDescriptions).map(([roleKey, roleData]) => (
                  <div key={roleKey} className="role-card-wrapper">
                    <input
                      type="radio"
                      id={roleKey}
                      name="role"
                      value={roleKey}
                      checked={role === roleKey}
                      onChange={(e) => setRole(e.target.value)}
                      className="role-radio"
                    />
                    <label htmlFor={roleKey} className="role-card">
                      <div className="role-card-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                          <path d={roleData.icon} />
                        </svg>
                      </div>
                      <div className="role-card-content">
                        <div className="role-card-title">{roleData.title}</div>
                        <div className="role-card-desc">{roleData.desc}</div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Username or Email - Dynamic based on role */}
            <div className="form-group">
              <label htmlFor="username">{role === 'customer' ? 'Email atau Username' : 'Username'}</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    {role === 'customer' ? (
                      <path d="M4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M4,6V18H20V6H4Z" />
                    ) : (
                      <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                    )}
                  </svg>
                </span>
                <input
                  type="text"
                  id="username"
                  placeholder={role === 'customer' ? 'Masukkan email atau username Anda' : 'Masukkan username Anda'}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    handleInputChange('username');
                  }}
                  className={errors.username ? 'input-error' : ''}
                />
              </div>
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>
            
            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
                  </svg>
                </span>
                <input
                  type="password"
                  id="password"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    handleInputChange('password');
                  }}
                  className={errors.password ? 'input-error' : ''}
                />
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            {/* Forgot Password Link */}
            <div className="forgot-password-link">
              <a href="#" onClick={handleForgotPassword}>Lupa Password?</a>
            </div>
            
            {/* Login Button */}
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Sedang Memproses...' : `Masuk sebagai ${role === 'admin' ? 'Admin' : role === 'kasir' ? 'Kasir' : 'Customer'}`}
            </button>
          </form>

          {/* Divider */}
          <div className="form-divider">
            <span>ATAU</span>
          </div>

          {/* Register as Customer */}
          <div className="register-section">
            <p className="register-text">Bukan staff apotek?</p>
            <button 
              type="button" 
              className="register-button"
              onClick={() => navigate('/register-customer')}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12,2A3,3 0 0,1 15,5A3,3 0 0,1 12,8A3,3 0 0,1 9,5A3,3 0 0,1 12,2M21,9H15V22H9V9H3V7H21V9Z" />
              </svg>
              Daftar sebagai Pelanggan
            </button>
            <p className="register-info">Daftar gratis untuk berbelanja obat secara online</p>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <p className="copyright">© 2025 Apotek Pemuda Farma. Semua hak dilindungi.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;