import { useState } from 'react';
import '../styles/ForgotPasswordPage.css';

const ForgotPasswordPage = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  // Show notification function
  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    
    if (!email) {
      showNotificationMessage('Email tidak boleh kosong!', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotificationMessage('Format email tidak valid!', 'error');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call for password reset
    setTimeout(() => {
      setIsLoading(false);
      showNotificationMessage('Link reset password telah dikirim ke email Anda!', 'success');
      
      // Clear email field after successful request
      setTimeout(() => {
        setEmail('');
      }, 2000);
    }, 2000);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-logo">
          {/* Mortar and pestle icon */}
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M14,15.61L12,14.5L10,15.61V11H14V15.61M14,7H10V9H14V7M12,2C9.36,2 7.2,4.16 7.2,6.8C7.2,8.27 7.83,9.59 8.83,10.5H6V20.8C6,21.46 6.54,22 7.2,22H16.8C17.46,22 18,21.46 18,20.8V10.5H15.17C16.17,9.59 16.8,8.27 16.8,6.8C16.8,4.16 14.64,2 12,2Z" />
          </svg>
        </div>
        
        <h1 className="forgot-password-title">Lupa Kata Sandi</h1>
        <p className="forgot-password-subtitle">
          Masukkan email Anda untuk mengatur ulang kata sandi.
        </p>
        
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                </svg>
              </span>
              <input
                type="email"
                id="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="reset-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="loading-spinner" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                </svg>
                Mengirim...
              </>
            ) : (
              'Kirim Link Reset'
            )}
          </button>
        </form>
        
        <div className="back-to-login">
          <button 
            type="button" 
            className="back-button"
            onClick={onBackToLogin}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
            </svg>
            Kembali ke Login
          </button>
        </div>
        
        <div className="copyright">
          © 2025
        </div>
      </div>

      {/* Notification Popup */}
      {showNotification && (
        <div className={`notification ${notificationType} ${showNotification ? 'show' : ''}`}>
          <div className="notification-content">
            <div className="notification-icon">
              {notificationType === 'success' && (
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z" />
                </svg>
              )}
              {notificationType === 'error' && (
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,7A1,1 0 0,0 11,8V12A1,1 0 0,0 12,13A1,1 0 0,0 13,12V8A1,1 0 0,0 12,7M12,17.5A1.5,1.5 0 0,0 13.5,16A1.5,1.5 0 0,0 12,14.5A1.5,1.5 0 0,0 10.5,16A1.5,1.5 0 0,0 12,17.5Z" />
                </svg>
              )}
            </div>
            <span className="notification-message">{notificationMessage}</span>
            <button 
              className="notification-close"
              onClick={() => setShowNotification(false)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;