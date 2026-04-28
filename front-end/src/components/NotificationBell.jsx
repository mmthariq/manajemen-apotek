import React, { useEffect, useRef, useState } from 'react';
import './NotificationBell.css';

const NOTIF_API = 'http://localhost:3000/api/dashboard/notifications';

const NotificationBell = ({ authToken }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!authToken) return;
    try {
      setIsLoading(true);
      const response = await fetch(NOTIF_API, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const result = await response.json();
      if (!response.ok) return;

      const data = result?.data || {};

      // Bangun list notifikasi dari data stok menipis & expired
      const items = [];

      const lowStock = Array.isArray(data.lowStockAlerts) ? data.lowStockAlerts : [];
      const expiring = Array.isArray(data.expiringAlerts) ? data.expiringAlerts : [];

      lowStock.forEach((item) => {
        items.push({
          id: `low-${item.id}`,
          type: 'warning',
          icon: '📦',
          title: 'Stok Menipis',
          message: `${item.name} — sisa ${item.stock} ${item.unit || 'unit'}`,
          priority: item.stock <= 5 ? 'high' : 'medium',
        });
      });

      expiring.forEach((item) => {
        const expDate = item.expiredDate
          ? new Date(item.expiredDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
          : '-';
        items.push({
          id: `exp-${item.id}`,
          type: 'danger',
          icon: '⚠️',
          title: 'Mendekati Kedaluwarsa',
          message: `${item.name} — exp. ${expDate}`,
          priority: 'high',
        });
      });

      // Jika API belum ada struktur detail, fallback ke totalAlerts
      if (items.length === 0 && data.totalAlerts > 0) {
        items.push({
          id: 'summary',
          type: 'info',
          icon: '🔔',
          title: 'Perlu Perhatian',
          message: `${data.totalAlerts} item memerlukan perhatian (stok/kedaluwarsa).`,
          priority: data.highPriorityAlerts > 0 ? 'high' : 'medium',
        });
      }

      setNotifications(items);
      setUnreadCount(items.filter((n) => n.priority === 'high').length || items.length);
    } catch (_) {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount + setiap 60 detik
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [authToken]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      // Tandai sudah dibaca saat dibuka
      setUnreadCount(0);
    }
  };

  return (
    <div className="notif-bell-wrapper" ref={dropdownRef}>
      {/* Tombol Lonceng */}
      <button
        className={`notif-bell-btn ${unreadCount > 0 ? 'has-notif' : ''}`}
        onClick={handleToggle}
        title="Notifikasi"
        aria-label={`${unreadCount} notifikasi`}
      >
        {/* Ikon lonceng SVG */}
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21" />
        </svg>

        {/* Badge jumlah */}
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Pulse ring animasi jika ada notif prioritas tinggi */}
        {unreadCount > 0 && <span className="notif-pulse" />}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span className="notif-title">🔔 Notifikasi</span>
            <span className="notif-count-label">
              {notifications.length} item
            </span>
          </div>

          <div className="notif-list">
            {isLoading ? (
              <div className="notif-empty">Memuat...</div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <span style={{ fontSize: '2rem' }}>✅</span>
                <p>Semua aman, tidak ada peringatan</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-item notif-${notif.type} ${notif.priority === 'high' ? 'notif-high' : ''}`}
                >
                  <span className="notif-icon">{notif.icon}</span>
                  <div className="notif-body">
                    <p className="notif-item-title">{notif.title}</p>
                    <p className="notif-item-msg">{notif.message}</p>
                  </div>
                  {notif.priority === 'high' && (
                    <span className="notif-priority-dot" title="Prioritas Tinggi" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="notif-footer">
            <button className="notif-refresh-btn" onClick={fetchNotifications}>
              ↻ Perbarui
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
