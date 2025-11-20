import React from 'react';
import '../styles/ExportModal.css';

const ExportModal = ({ isOpen, onClose, onConfirm, exportType, dateRange }) => {
  if (!isOpen) return null;

  const exportDetails = {
    pdf: {
      title: 'Export Laporan ke PDF',
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32">
          <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          <path fill="currentColor" d="M10.5,14.5C10.08,14.5 9.69,14.38 9.36,14.15C9,13.92 8.74,13.58 8.58,13.18C8.42,12.78 8.38,12.35 8.46,11.93C8.54,11.5 8.74,11.11 9.04,10.81C9.34,10.5 9.73,10.3 10.15,10.22C10.58,10.14 11,10.18 11.4,10.34C11.8,10.5 12.14,10.76 12.37,11.12C12.6,11.45 12.72,11.84 12.72,12.26C12.72,12.8 12.5,13.32 12.11,13.71C11.72,14.1 11.2,14.32 10.66,14.32L10.5,14.5M10.5,11.5C10.22,11.5 9.96,11.61 9.77,11.8C9.58,11.97 9.47,12.22 9.47,12.5C9.47,12.78 9.58,13.03 9.77,13.22C9.96,13.39 10.22,13.5 10.5,13.5C10.78,13.5 11.04,13.39 11.23,13.22C11.42,13.03 11.53,12.78 11.53,12.5C11.53,12.22 11.42,11.97 11.23,11.8C11.04,11.61 10.78,11.5 10.5,11.5Z" />
        </svg>
      ),
      description: 'File PDF akan berisi laporan analitik lengkap dengan grafik dan tabel data.',
      fileInfo: 'Format: Portable Document Format (.pdf)'
    },
    excel: {
      title: 'Export Laporan ke Excel',
      icon: (
        <svg viewBox="0 0 24 24" width="32" height="32">
          <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          <path fill="currentColor" d="M19.93,18.12C19.75,18.81 19.39,19.39 18.9,19.8C18.4,20.21 17.8,20.4 17.19,20.4C16.5,20.4 15.85,20.18 15.3,19.8L12,17.6L8.7,19.8C8.15,20.18 7.5,20.4 6.81,20.4C6.2,20.4 5.6,20.21 5.1,19.8C4.61,19.39 4.25,18.81 4.07,18.12L2,8.4L12,14.4L22,8.4L19.93,18.12Z" />
        </svg>
      ),
      description: 'File Excel akan berisi data mentah yang dapat diedit dan dianalisis lebih lanjut.',
      fileInfo: 'Format: Microsoft Excel (.xlsx)'
    }
  };

  const currentExport = exportDetails[exportType];

  return (
    <div className="export-modal-overlay" onClick={onClose}>
      <div className="export-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="export-modal-header">
          <div className="export-icon">
            {currentExport.icon}
          </div>
          <h3 className="export-title">{currentExport.title}</h3>
          <button className="close-button" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
        
        <div className="export-modal-body">
          <div className="export-info">
            <h4>Detail Export:</h4>
            <ul>
              <li><strong>Periode:</strong> {dateRange}</li>
              <li><strong>Format:</strong> {currentExport.fileInfo}</li>
              <li><strong>Ukuran estimasi:</strong> ~500 KB</li>
            </ul>
          </div>
          
          <div className="export-description">
            <p>{currentExport.description}</p>
          </div>
          
          <div className="export-preview">
            <h4>Yang akan disertakan dalam laporan:</h4>
            <div className="preview-items">
              <div className="preview-item">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                </svg>
                <span>Ringkasan Penjualan</span>
              </div>
              <div className="preview-item">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                </svg>
                <span>Data Stok Menipis</span>
              </div>
              <div className="preview-item">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                </svg>
                <span>Analitik Supplier</span>
              </div>
              <div className="preview-item">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                </svg>
                <span>Grafik Pendapatan</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="export-modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Batal
          </button>
          <button className="btn-export" onClick={onConfirm}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            Export {exportType.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;