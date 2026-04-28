import React, { useState } from 'react';
import useRealtimeClock from '../hooks/useRealtimeClock';
import NotificationBell from '../components/NotificationBell';
import Sidebar from '../components/Sidebar';
import '../styles/LaporanPenjualanKasir.css';

const API_BASE_URL = 'http://localhost:3000/api/orders';
const REPORT_EXPORT_URL = 'http://localhost:3000/api/reports/sales-kasir/export';

const LaporanPenjualanKasir = ({ onLogout, userRole, currentUser, authToken }) => {
  const clock = useRealtimeClock();
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success'); // 'success', 'error', 'info'
  const [transactions, setTransactions] = useState([]);

  const buildHeaders = () => {
    const headers = {};
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    return headers;
  };

  // Get current date in YYYY-MM-DD format for the date input
  function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Handle displaying transactions for the selected date
  const handleDisplayTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_BASE_URL, {
        headers: buildHeaders(),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memuat laporan transaksi.');
      }

      const filtered = (Array.isArray(result.data) ? result.data : []).filter((item) => {
        if (!item.createdAt) return false;
        const d = new Date(item.createdAt);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}` === selectedDate;
      });

      setTransactions(filtered);
    } catch (error) {
      showNotificationMessage(error.message || 'Terjadi kesalahan saat memuat transaksi.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (authToken) {
      handleDisplayTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, selectedDate]);

  // Show notification function
  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Handle exporting to PDF
  const handleExportPDF = async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams({ date: selectedDate, type: 'pdf' });
      const response = await fetch(`${REPORT_EXPORT_URL}?${query.toString()}`, {
        headers: buildHeaders(),
      });

      if (!response.ok) {
        let message = 'Gagal mengekspor laporan PDF.';
        try {
          const result = await response.json();
          message = result.message || message;
        } catch (error) {
          // Abaikan parse error saat response bukan JSON.
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-penjualan-kasir-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showNotificationMessage('Laporan berhasil diekspor ke PDF!', 'success');
    } catch (error) {
      showNotificationMessage(error.message || 'Terjadi kesalahan saat ekspor PDF.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle exporting to Excel
  const handleExportExcel = async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams({ date: selectedDate, type: 'excel' });
      const response = await fetch(`${REPORT_EXPORT_URL}?${query.toString()}`, {
        headers: buildHeaders(),
      });

      if (!response.ok) {
        let message = 'Gagal mengekspor laporan Excel.';
        try {
          const result = await response.json();
          message = result.message || message;
        } catch (error) {
          // Abaikan parse error saat response bukan JSON.
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-penjualan-kasir-${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showNotificationMessage('Laporan berhasil diekspor ke Excel!', 'success');
    } catch (error) {
      showNotificationMessage(error.message || 'Terjadi kesalahan saat ekspor Excel.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={onLogout} userRole={userRole} currentUser={currentUser} />
      
      <div className="main-content">
        <div className="header">
          <h1>Laporan Penjualan</h1>
          <div className="user-info">
            <span className="date">{clock}</span>
            <NotificationBell authToken={authToken} />
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

        <div className="laporan-container">
          <h2>Laporan Penjualan</h2>
          
          <div className="filter-container">
            <div className="date-filter">
              <input 
                type="date" 
                value={selectedDate} 
                onChange={handleDateChange} 
                className="date-input"
              />
            </div>
            <button 
              className="display-button"
              onClick={handleDisplayTransactions}
              disabled={isLoading}
            >
              {isLoading ? 'Memuat...' : 'Tampilkan'}
            </button>
          </div>
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Transaksi</th>
                  <th>Waktu</th>
                  <th>Obat</th>
                  <th>Jumlah</th>
                  <th>Total Harga</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>Belum ada transaksi untuk tanggal ini.</td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>TRX-{String(transaction.id).padStart(4, '0')}</td>
                      <td>{transaction.createdAt ? new Date(transaction.createdAt).toLocaleTimeString('id-ID') : '-'}</td>
                      <td>Order Online</td>
                      <td>{Number(transaction.totalItems || 0)}</td>
                      <td>Rp {Number(transaction.totalPrice || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="export-container">
            <button 
              className="export-button export-pdf"
              onClick={handleExportPDF}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M9.5 11.5C9.5 12.3 8.8 13 8 13H7V15H5.5V9H8C8.8 9 9.5 9.7 9.5 10.5V11.5M14.5 13.5C14.5 14.3 13.8 15 13 15H10.5V9H13C13.8 9 14.5 9.7 14.5 10.5V13.5M18.5 10.5H17V11.5H18.5V13H17V15H15.5V9H18.5V10.5M8 10.5H7V11.5H8V10.5M13 10.5H12V13.5H13V10.5Z" />
              </svg>
              {isLoading ? 'Mengekspor...' : 'Ekspor PDF'}
            </button>
            <button 
              className="export-button export-excel"
              onClick={handleExportExcel}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.08V19.92Q22 20.26 21.76 20.5 21.5 20.75 21.17 20.75H7.83Q7.5 20.75 7.24 20.5 7 20.26 7 19.92V17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.24 2.5 7 2.83 7H7V4.08Q7 3.74 7.24 3.5 7.5 3.25 7.83 3.25M7 13.06L8.18 15.28H9.97L8 12.06L9.93 8.89H8.22L7.13 10.9L6.03 8.89H4.32L6.2 12.06L4.27 15.28H6.06M13.88 19.5V17H8.25V19.5M13.88 15.75V12.63H12V15.75M13.88 11.38V8.25H12V11.38M13.88 7V4.5H8.25V7M20.75 19.5V17H15.13V19.5M20.75 15.75V12.63H15.13V15.75M20.75 11.38V8.25H15.13V11.38M20.75 7V4.5H15.13V7Z" />
              </svg>
              {isLoading ? 'Mengekspor...' : 'Ekspor Excel'}
            </button>
          </div>
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
              {notificationType === 'info' && (
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

export default LaporanPenjualanKasir;