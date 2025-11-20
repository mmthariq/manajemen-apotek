import React, { useState } from 'react';
import '../styles/LaporanAnalitik.css';
import Sidebar from '../components/Sidebar';
import ExportModal from '../components/ExportModal';

const LaporanAnalitik = ({ onLogout }) => {
  // Default date range for the report
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-01-31');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  
  // Modal states
  const [exportModal, setExportModal] = useState({
    isOpen: false,
    type: null
  });
  
  // Sample data for summary cards
  const summaryData = {
    totalPenjualan: 'Rp 45.6M',
    obatTerlaris: '2,345',
    stokMenipis: '15',
    supplierAktif: '24',
    pendapatan: 'Rp 12.3M'
  };
  
  // Sample data for low stock products
  const lowStockProducts = [
    { name: 'Paracetamol', category: 'Obat Bebas', stock: 5, status: 'Kritis' },
    { name: 'Amoxicillin', category: 'Obat Keras', stock: 8, status: 'Menipis' },
    { name: 'Vitamin C', category: 'Suplemen', stock: 10, status: 'Menipis' }
  ];
  
  // Categories for filter dropdown
  const categories = [
    'Semua Kategori',
    'Obat Bebas',
    'Obat Keras',
    'Suplemen',
    'Alat Kesehatan'
  ];
  
  // Function to handle filter application
  const handleApplyFilter = () => {
    console.log('Applying filters:', { startDate, endDate, selectedCategory });
    // In a real application, this would fetch filtered data from an API
  };
  
  // Function to open export modal
  const handleExportClick = (type) => {
    setExportModal({
      isOpen: true,
      type: type
    });
  };
  
  // Function to close export modal
  const handleCloseExportModal = () => {
    setExportModal({
      isOpen: false,
      type: null
    });
  };
  
  // Function to confirm export
  const handleConfirmExport = () => {
    const { type } = exportModal;
    
    // Show loading state (you can add a loading spinner here)
    console.log(`Exporting report as ${type.toUpperCase()}...`);
    
    // Simulate export process
    setTimeout(() => {
      console.log(`${type.toUpperCase()} export completed!`);
      // You can show a success notification here
      setExportModal({ isOpen: false, type: null });
    }, 2000);
    
    // In a real application, this would:
    // 1. Send request to backend
    // 2. Generate the file
    // 3. Download the file
    // 4. Show success/error message
  };
  
  // Function to handle report print
  const handlePrintReport = () => {
    console.log('Printing report');
    window.print();
  };

  // Get formatted date range
  const getDateRange = () => {
    const start = new Date(startDate).toLocaleDateString('id-ID');
    const end = new Date(endDate).toLocaleDateString('id-ID');
    return `${start} - ${end}`;
  };

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={onLogout} />
      
      <div className="main-content">
        <div className="header">
          <h1>Dashboard</h1>
          <div className="user-info">
            <span className="date">12 May 2025, 07:41:55</span>
            <div className="admin-profile">
              <span>Admin</span>
              <div className="profile-image">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="analytics-header">
          <div className="title-section">
            <h2>Laporan Analitik</h2>
            <p className="date-range">{getDateRange()}</p>
          </div>
          <div className="action-buttons">
            <button className="action-button print-button" onClick={handlePrintReport} title="Print Laporan">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
            </button>
            <button className="action-button export-button pdf-button" onClick={() => handleExportClick('pdf')} title="Export ke PDF">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </button>
            <button className="action-button export-button excel-button" onClick={() => handleExportClick('excel')} title="Export ke Excel">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="filter-section">
          <div className="date-filters">
            <input 
              type="date" 
              className="date-input" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input 
              type="date" 
              className="date-input" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <div className="category-filter">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <button className="apply-button" onClick={handleApplyFilter}>
            Apply
          </button>
        </div>
        
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Penjualan</h3>
            <p className="card-value">{summaryData.totalPenjualan}</p>
          </div>
          <div className="summary-card">
            <h3>Obat Terlaris</h3>
            <p className="card-value">{summaryData.obatTerlaris}</p>
          </div>
          <div className="summary-card">
            <h3>Stok Menipis</h3>
            <p className="card-value">{summaryData.stokMenipis}</p>
          </div>
          <div className="summary-card">
            <h3>Supplier Aktif</h3>
            <p className="card-value">{summaryData.supplierAktif}</p>
          </div>
          <div className="summary-card">
            <h3>Pendapatan</h3>
            <p className="card-value">{summaryData.pendapatan}</p>
          </div>
        </div>
        
        <div className="low-stock-section">
          <h3>Stok Menipis</h3>
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Obat</th>
                  <th>Kategori</th>
                  <th>Stok</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`status-badge ${product.status.toLowerCase()}`}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModal.isOpen}
        onClose={handleCloseExportModal}
        onConfirm={handleConfirmExport}
        exportType={exportModal.type}
        dateRange={getDateRange()}
      />
    </div>
  );
};

export default LaporanAnalitik;
