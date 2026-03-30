import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CustomerRegistration.css';

const CustomerRegistration = ({ onRegistrationSuccess }) => {
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak sesuai';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon harus diisi';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Alamat harus diisi';
    }

    return newErrors;
  };

  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotificationMessage('Mohon periksa kembali form Anda', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Dalam aplikasi nyata, ini akan memanggil API backend
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              id: Math.floor(Math.random() * 10000),
              ...formData,
              isMember: true,
              membershipDate: new Date().toISOString()
            }
          });
        }, 1500);
      });

      if (response.success) {
        // Simpan data ke localStorage
        localStorage.setItem('registeredCustomerData', JSON.stringify(response.data));
        setIsRegistered(true);
        setIsLoading(false);

        if (onRegistrationSuccess) {
          onRegistrationSuccess(response.data);
        }

        showNotificationMessage('Pendaftaran berhasil! Silakan login dengan akun Anda.', 'success');
      }
    } catch (error) {
      showNotificationMessage('Terjadi kesalahan saat registrasi', 'error');
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  // Success Screen
  if (isRegistered) {
    return (
      <div className="registration-container">
        <div className="registration-box success-box">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="11" strokeWidth="2"/>
              <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h1 className="success-title">Pendaftaran Berhasil! 🎉</h1>
          <p className="success-subtitle">Selamat datang menjadi member Apotek Pemuda Farma</p>

          <div className="success-info">
            <div className="info-item">
              <span className="info-icon">✓</span>
              <span>Akun Anda telah berhasil dibuat</span>
            </div>
            <div className="info-item">
              <span className="info-icon">✓</span>
              <span>Anda sekarang menjadi member resmi</span>
            </div>
            <div className="info-item">
              <span className="info-icon">✓</span>
              <span>Silakan login untuk mulai berbelanja</span>
            </div>
          </div>

          <div className="activation-info">
            <p className="activation-title">📧 Email Verifikasi</p>
            <p>Link verifikasi telah dikirim ke email <strong>{formData.email}</strong></p>
          </div>

          <div className="success-actions">
            <button className="btn-back-to-login" onClick={handleBackToLogin}>
              Kembali ke Halaman Login
            </button>
            <p className="next-step">Gunakan email dan password yang Anda daftarkan untuk login sebagai <strong>Customer</strong></p>
          </div>

          <div className="divider"></div>

          <div className="welcome-info">
            <h3>Nikmati Kemudahan Belanja Online!</h3>
            <ul className="benefits-list">
              <li>💊 Ribuan produk obat berkualitas</li>
              <li>🏪 Layanan dari apoteker berpengalaman</li>
              <li>📦 Pengiriman cepat dan aman</li>
              <li>⭐ Poin reward setiap pembelian</li>
            </ul>
          </div>

          {showNotification && (
            <div className={`notification ${notificationType}`}>
              {notificationMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="registration-container">
      <div className="registration-box">
        <div className="registration-header">
          <h1>Daftar Sebagai Member</h1>
          <p>Daftarkan diri Anda untuk berbelanja obat secara online</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="name">Nama Lengkap *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Masukkan nama lengkap Anda"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Masukkan email Anda"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Masukkan password (minimal 6 karakter)"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Konfirmasi Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Masukkan ulang password"
              className={errors.confirmPassword ? 'input-error' : ''}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Nomor Telepon *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Masukkan nomor telepon Anda"
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Alamat *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Masukkan alamat lengkap Anda"
              rows="3"
              className={errors.address ? 'input-error' : ''}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Sedang Mendaftar...' : 'Daftar Sekarang'}
          </button>

          <div className="login-link">
            <p>Sudah memiliki akun? <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Masuk di sini</a></p>
          </div>
        </form>
      </div>

      {showNotification && (
        <div className={`notification ${notificationType}`}>
          {notificationMessage}
        </div>
      )}
    </div>
  );
};

export default CustomerRegistration;
