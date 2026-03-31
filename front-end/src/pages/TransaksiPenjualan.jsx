import React, { useEffect, useState } from 'react';
import '../styles/TransaksiPenjualan.css';
import Sidebar from '../components/Sidebar';

const API_BASE_URL = 'http://localhost:3000/api/orders';

const TransaksiPenjualan = ({ onLogout, authToken }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formatToRupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

  const buildHeaders = () => {
    const headers = {};
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    return headers;
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await fetch(API_BASE_URL, {
        headers: buildHeaders(),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memuat transaksi penjualan.');
      }

      setTransactions(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat memuat transaksi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchTransactions();
    }
  }, [authToken]);

  const resolveStatusLabel = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'pending_payment': return 'Menunggu Pembayaran';
      case 'payment_uploaded': return 'Menunggu Verifikasi';
      case 'paid': return 'Dibayar';
      case 'processed': return 'Diproses';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status || '-';
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={onLogout} />

      <div className="main-content">
        <div className="header">
          <h1>Transaksi Penjualan</h1>
          <div className="user-info">
            <span className="date">{new Date().toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="content-header">
          <h2>Transaksi Penjualan</h2>
          <button className="add-button" onClick={fetchTransactions}>
            Muat Ulang
          </button>
        </div>

        <div className="table-container">
          {errorMessage && <p>{errorMessage}</p>}
          {isLoading && <p>Memuat data transaksi...</p>}
          <table className="data-table transactions-table">
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tanggal</th>
                <th>Total Item</th>
                <th>Total Harga</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5}>Belum ada transaksi.</td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx.id}>
                    <td>TRX-{String(trx.id).padStart(4, '0')}</td>
                    <td>{trx.order_time ? new Date(trx.order_time).toLocaleString('id-ID') : '-'}</td>
                    <td>{Number(trx.total_items || 0)}</td>
                    <td>{formatToRupiah(trx.total_amount)}</td>
                    <td>{resolveStatusLabel(trx.order_status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransaksiPenjualan;