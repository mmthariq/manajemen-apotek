import React, { useState, useCallback } from 'react';
import '../styles/PaymentInstructions.css';

// ── Dummy Payment Data ──
const PAYMENT_CONFIG = {
  bank: {
    name: 'BCA',
    code: 'Bank Central Asia',
    accountNumber: '1234567890',
    accountHolder: 'Apotek Pemuda',
  },
  qris: {
    merchantName: 'Apotek Pemuda',
    imageUrl: '/images/qris-apotek-pemuda.png',
  },
  deadline: '1×24 jam',
};

/**
 * PaymentInstructions – Reusable component showing payment info
 * Only renders when status is PENDING (Menunggu Pembayaran).
 *
 * @param {number}  totalAmount – Total to be paid
 * @param {string}  status      – Normalized order status (PENDING, VERIFIED, etc.)
 * @param {string}  [variant]   – 'full' (default) | 'compact' for modals
 */
const PaymentInstructions = ({ totalAmount = 0, status, variant = 'full' }) => {
  const [activeTab, setActiveTab] = useState('transfer');
  const [copiedField, setCopiedField] = useState(null);

  // Only show for pending orders
  const normalizedStatus = String(status || '').toUpperCase();
  const isPending =
    normalizedStatus === 'PENDING' ||
    normalizedStatus === 'PENDING_PAYMENT' ||
    normalizedStatus === '';

  if (!isPending) return null;

  const formatCurrency = (value) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(value || 0);

  const handleCopy = useCallback((text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  }, []);

  const isCompact = variant === 'compact';

  return (
    <div className="payment-instructions" style={isCompact ? { padding: 18 } : {}}>
      {/* ── Header ── */}
      <div className="payment-header">
        <div className="payment-header-icon">💳</div>
        <div>
          <div className="payment-header-text">Instruksi Pembayaran</div>
          <div className="payment-header-sub">Pilih metode pembayaran di bawah ini</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="payment-tabs">
        <button
          className={`payment-tab ${activeTab === 'transfer' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfer')}
        >
          <span className="payment-tab-icon">🏦</span>
          Transfer Bank
        </button>
        <button
          className={`payment-tab ${activeTab === 'qris' ? 'active' : ''}`}
          onClick={() => setActiveTab('qris')}
        >
          <span className="payment-tab-icon">📱</span>
          QRIS
        </button>
      </div>

      {/* ── Transfer Bank Content ── */}
      {activeTab === 'transfer' && (
        <div className="payment-tab-content" key="transfer">
          <div className="payment-bank-card">
            {/* Bank name */}
            <div className="payment-bank-name">
              <div className="payment-bank-logo">{PAYMENT_CONFIG.bank.name}</div>
              <div>
                <div className="payment-bank-label">{PAYMENT_CONFIG.bank.code}</div>
                <div className="payment-bank-sublabel">{PAYMENT_CONFIG.bank.name}</div>
              </div>
            </div>

            {/* Account number */}
            <div className="payment-copy-row">
              <div>
                <div className="payment-copy-label">No. Rekening</div>
                <div className="payment-copy-value">{PAYMENT_CONFIG.bank.accountNumber}</div>
              </div>
              <button
                className={`payment-copy-btn ${copiedField === 'account' ? 'copied' : ''}`}
                onClick={() => handleCopy(PAYMENT_CONFIG.bank.accountNumber, 'account')}
              >
                <span className="payment-copy-btn-icon">
                  {copiedField === 'account' ? '✓' : '📋'}
                </span>
                {copiedField === 'account' ? 'Tersalin!' : 'Salin'}
              </button>
            </div>

            {/* Transfer amount */}
            <div className="payment-copy-row">
              <div>
                <div className="payment-copy-label">Jumlah Transfer</div>
                <div className="payment-copy-value amount">{formatCurrency(totalAmount)}</div>
              </div>
              <button
                className={`payment-copy-btn ${copiedField === 'amount' ? 'copied' : ''}`}
                onClick={() => handleCopy(String(totalAmount), 'amount')}
              >
                <span className="payment-copy-btn-icon">
                  {copiedField === 'amount' ? '✓' : '📋'}
                </span>
                {copiedField === 'amount' ? 'Tersalin!' : 'Salin'}
              </button>
            </div>

            {/* Account holder */}
            <div className="payment-account-holder">
              <span className="payment-account-holder-label">Atas Nama:</span>
              <span className="payment-account-holder-name">
                {PAYMENT_CONFIG.bank.accountHolder}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── QRIS Content ── */}
      {activeTab === 'qris' && (
        <div className="payment-tab-content" key="qris">
          <div className="payment-qris-card">
            <div className="payment-qris-image-wrapper">
              <img
                src={PAYMENT_CONFIG.qris.imageUrl}
                alt="QRIS Apotek Pemuda"
                className="payment-qris-image"
              />
            </div>

            <div className="payment-qris-merchant">
              {PAYMENT_CONFIG.qris.merchantName}
            </div>
            <div className="payment-qris-hint">
              Scan kode QR di atas menggunakan aplikasi<br />
              e-wallet atau mobile banking Anda
            </div>

            <div className="payment-qris-total">
              <span className="payment-qris-total-label">Total:</span>
              <span className="payment-qris-total-value">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Warning ── */}
      <div className="payment-warning">
        <span className="payment-warning-icon">⚠️</span>
        <div className="payment-warning-text">
          Selesaikan pembayaran dalam <strong>{PAYMENT_CONFIG.deadline}</strong> agar
          pesanan tidak otomatis dibatalkan. Pastikan jumlah transfer sesuai.
        </div>
      </div>

      {/* ── Upload hint ── */}
      <div className="payment-upload-hint">
        <span className="payment-upload-hint-icon">💡</span>
        Setelah melakukan pembayaran, upload bukti transfer melalui menu <strong>&nbsp;Riwayat Pesanan</strong>.
      </div>
    </div>
  );
};

export default PaymentInstructions;
