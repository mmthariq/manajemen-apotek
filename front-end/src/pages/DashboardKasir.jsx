import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/Dashboard.css';
import DashboardLayout from '../components/DashboardLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ORDER_API_BASE_URL = 'http://localhost:3000/api/orders';
const ANALYTICS_API_BASE_URL = 'http://localhost:3000/api/dashboard/analytics';

const DashboardKasir = ({ onLogout, userRole, currentUser, authToken }) => {
  const [searchParams] = useSearchParams();
  const isVerificationMode = searchParams.get('tab') === 'verification';
  const [onlineOrders, setOnlineOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersMessage, setOrdersMessage] = useState('');
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [hourlySalesData, setHourlySalesData] = useState([]);
  const [summary, setSummary] = useState({
    penjualanHariIni: 0,
    transaksiHariIni: 0,
  });

  // Format currency to Rupiah
  const formatToRupiah = (value) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const normalizedOrders = useMemo(
    () => onlineOrders.map((order) => ({
      ...order,
      resolvedStatus: String(order?.order_status || '').toLowerCase(),
    })),
    [onlineOrders]
  );

  const buildHeaders = (includeJson = false) => {
    const headers = {};
    if (includeJson) {
      headers['Content-Type'] = 'application/json';
    }
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    return headers;
  };

  const fetchOnlineOrders = async () => {
    try {
      setIsOrdersLoading(true);
      setOrdersMessage('');

      const response = await fetch(ORDER_API_BASE_URL, {
        headers: buildHeaders(),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memuat pesanan online.');
      }

      setOnlineOrders(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setOrdersMessage(error.message || 'Terjadi kesalahan saat mengambil pesanan online.');
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const fetchDashboardAnalytics = async () => {
    try {
      const response = await fetch(ANALYTICS_API_BASE_URL);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memuat analitik dashboard kasir.');
      }

      const data = result.data || {};
      setHourlySalesData(Array.isArray(data.hourlySales) ? data.hourlySales : []);
      setSummary(data.summary || { penjualanHariIni: 0, transaksiHariIni: 0 });
    } catch (error) {
      setOrdersMessage(error.message || 'Terjadi kesalahan saat memuat analitik.');
    }
  };

  useEffect(() => {
    if (!authToken) {
      return;
    }

    fetchOnlineOrders();
    fetchDashboardAnalytics();
  }, [authToken]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab !== 'verification') {
      return;
    }

    const section = document.getElementById('kasir-verifikasi-pembayaran');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchParams]);

  const handleVerifyPayment = async (orderId) => {
    try {
      setProcessingOrderId(orderId);
      setOrdersMessage('');

      const response = await fetch(`${ORDER_API_BASE_URL}/${orderId}/verify-payment`, {
        method: 'PATCH',
        headers: buildHeaders(),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memverifikasi pembayaran.');
      }

      setOrdersMessage(`Pembayaran untuk pesanan #${orderId} berhasil diverifikasi.`);
      await fetchOnlineOrders();
    } catch (error) {
      setOrdersMessage(error.message || 'Terjadi kesalahan saat memverifikasi pembayaran.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setProcessingOrderId(orderId);
      setOrdersMessage('');

      const response = await fetch(`${ORDER_API_BASE_URL}/${orderId}/status`, {
        method: 'PATCH',
        headers: buildHeaders(true),
        body: JSON.stringify({ status }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memperbarui status pesanan.');
      }

      setOrdersMessage(`Status pesanan #${orderId} berhasil diubah ke ${status}.`);
      await fetchOnlineOrders();
    } catch (error) {
      setOrdersMessage(error.message || 'Terjadi kesalahan saat memperbarui status pesanan.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const renderStatusLabel = (status) => {
    switch (status) {
      case 'pending_payment':
        return 'Menunggu Pembayaran';
      case 'payment_uploaded':
        return 'Menunggu Verifikasi Kasir';
      case 'paid':
        return 'Dibayar';
      case 'processed':
        return 'Diproses';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status || '-';
    }
  };

  const getStatusClassName = (status) => {
    if (status === 'completed') return 'completed';
    if (status === 'cancelled') return 'cancelled';
    return 'pending';
  };

  const resolveProofImageUrl = (proofPath) => {
    if (!proofPath) {
      return null;
    }

    if (String(proofPath).startsWith('http')) {
      return proofPath;
    }

    return `http://localhost:3000${proofPath}`;
  };

  return (
    <DashboardLayout onLogout={onLogout} userRole={userRole} currentUser={currentUser}>
      <div className="main-content">
        <div className="header">
          <h1>Dashboard Kasir</h1>
          <div className="user-info">
            <span className="date">12 May 2025, 07:41:55</span>
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
        
        {!isVerificationMode && (
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Penjualan Hari Ini</span>
              <h2 className="stat-value">{formatToRupiah(Number(summary.penjualanHariIni || 0))}</h2>
              <span className="stat-change">akumulasi transaksi hari ini</span>
            </div>
            <div className="stat-icon transaction-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M3,6H21V18H3V6M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z" />
              </svg>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Jumlah Transaksi</span>
              <h2 className="stat-value">{Number(summary.transaksiHariIni || 0)}</h2>
              <span className="stat-change">transaksi hari ini</span>
            </div>
            <div className="stat-icon medicine-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7Z" />
              </svg>
            </div>
          </div>
        </div>
        )}
        
        {!isVerificationMode && (
        <div className="chart-section full-width">
          <h2>Grafik Penjualan Per Jam</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={hourlySalesData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatToRupiah} />
                <Tooltip formatter={(value) => formatToRupiah(value)} />
                <Area type="monotone" dataKey="penjualan" name="Penjualan" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}
        
        <div className="table-section full-width" id="kasir-verifikasi-pembayaran">
          <h2>Verifikasi Pembayaran Online</h2>
          {ordersMessage && <p className="orders-message">{ordersMessage}</p>}
          {isOrdersLoading ? (
            <p>Memuat pesanan online...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Pesanan</th>
                  <th>Total</th>
                  <th>Waktu</th>
                  <th>Bukti Upload</th>
                  <th>Status</th>
                  <th>Aksi Kasir</th>
                </tr>
              </thead>
              <tbody>
                {normalizedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6}>Belum ada pesanan online.</td>
                  </tr>
                ) : (
                  normalizedOrders.slice(0, 15).map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{formatToRupiah(Number(order.total_amount || 0))}</td>
                      <td>{order.order_time ? new Date(order.order_time).toLocaleString('id-ID') : '-'}</td>
                      <td>
                        {order.payment_proof_image_url ? (
                          <a href={resolveProofImageUrl(order.payment_proof_image_url)} target="_blank" rel="noreferrer">
                            <img
                              src={resolveProofImageUrl(order.payment_proof_image_url)}
                              alt={`Bukti bayar ${order.id}`}
                              className="payment-proof-thumb"
                            />
                          </a>
                        ) : (
                          <span className="action-muted">Belum upload</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClassName(order.resolvedStatus)}`}>
                          {renderStatusLabel(order.resolvedStatus)}
                        </span>
                      </td>
                      <td>
                        <div className="cashier-actions">
                          {order.resolvedStatus === 'payment_uploaded' && (
                            <button
                              className="action-btn approve"
                              onClick={() => handleVerifyPayment(order.id)}
                              disabled={processingOrderId === order.id}
                            >
                              Verifikasi
                            </button>
                          )}
                          {order.resolvedStatus === 'paid' && (
                            <button
                              className="action-btn process"
                              onClick={() => handleUpdateStatus(order.id, 'processed')}
                              disabled={processingOrderId === order.id}
                            >
                              Proses
                            </button>
                          )}
                          {order.resolvedStatus === 'processed' && (
                            <button
                              className="action-btn complete"
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                              disabled={processingOrderId === order.id}
                            >
                              Selesaikan
                            </button>
                          )}
                          {!['payment_uploaded', 'paid', 'processed'].includes(order.resolvedStatus) && (
                            <span className="action-muted">Tidak ada aksi</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {!isVerificationMode && (
        <div className="table-section full-width">
          <h2>Transaksi Terakhir</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Waktu</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {normalizedOrders.slice(0, 5).map((order) => (
                <tr key={`recent-${order.id}`}>
                  <td>#{order.id}</td>
                  <td>{order.order_time ? new Date(order.order_time).toLocaleTimeString('id-ID') : '-'}</td>
                  <td>{formatToRupiah(Number(order.total_amount || 0))}</td>
                  <td>
                    <span className={`status-badge ${getStatusClassName(order.resolvedStatus)}`}>
                      {renderStatusLabel(order.resolvedStatus)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardKasir;
