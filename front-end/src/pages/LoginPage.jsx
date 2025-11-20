import { useState } from 'react';
import '../styles/LoginPage.css';
import ForgotPasswordPage from './ForgotPasswordPage';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login attempt with:', { username, password, role });
    onLogin(username, password, role);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  // Show forgot password page if requested
  if (showForgotPassword) {
    return <ForgotPasswordPage onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img 
            src="/images/mortar.png"  
            width="48" 
            height="48"
          />
        </div>
        <h1 className="login-title">Apotek Pemuda Farma</h1>
        <p className="login-subtitle">Silakan login untuk melanjutkan</p>
        
        <form onSubmit={handleLogin}>
          {/* Role Selection */}
          <div className="form-group">
            <label>Pilih Role</label>
            <div className="role-selection">
              <div className="role-option">
                <input
                  type="radio"
                  id="admin"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={(e) => setRole(e.target.value)}
                />
                <label htmlFor="admin" className="role-label">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1.5V3.5L19 7V9H21ZM3 5V7L7 11V21C7 21.6 7.4 22 8 22H16C16.6 22 17 21.6 17 21V11L21 7V5H3ZM5.4 9H18.6L15.8 11.8C15.3 12.3 14.7 12.5 14 12.5H10C9.3 12.5 8.7 12.3 8.2 11.8L5.4 9Z" />
                  </svg>
                  Admin
                </label>
              </div>
              <div className="role-option">
                <input
                  type="radio"
                  id="kasir"
                  name="role"
                  value="kasir"
                  checked={role === 'kasir'}
                  onChange={(e) => setRole(e.target.value)}
                />
                <label htmlFor="kasir" className="role-label">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M2 17H22V21H2V17M3.96 11.03L2.59 9.67L6.36 5.9L7.73 7.27L3.96 11.03M20.04 11.03L16.27 7.27L17.64 5.9L21.41 9.67L20.04 11.03M12 6C15.31 6 18 8.69 18 12V15H6V12C6 8.69 8.69 6 12 6M12 8C9.79 8 8 9.79 8 12V13H16V12C16 9.79 14.21 8 12 8Z" />
                  </svg>
                  Kasir
                </label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
              </span>
              <input
                type="text"
                id="username"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          
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
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-footer">
            <div className="forgot-password">
              <a href="#" onClick={handleForgotPassword}>Lupa Sandi? Klik di sini.</a>
            </div>
            
            <div className="login-type">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z" />
              </svg>
              <span>Login sebagai {role === 'admin' ? 'Admin' : 'Kasir'}</span>
            </div>
          </div>
          
          <button type="submit" className="login-button">
            Masuk sebagai {role === 'admin' ? 'Admin' : 'Kasir'}
          </button>
        </form>
        
        <div className="copyright">
          © 2025
        </div>
      </div>
    </div>
  );
};

export default LoginPage;