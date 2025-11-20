import React, { useState } from 'react';
import '../styles/TransaksiPenjualan.css';
import Sidebar from '../components/Sidebar';
import TransaksiForm from '../components/TransaksiForm';
import ConfirmModal from '../components/ConfirmModal';

const TransaksiPenjualan = ({ onLogout }) => {
  // Sample data for transactions
  const [transactions, setTransactions] = useState([
    {
      id: 'TRX-001',
      tanggal: '12 May 2025',
      namaObat: 'Paracetamol',
      jumlah: 2,
      hargaSatuan: 'Rp 10.000',
      totalHarga: 'Rp 20.000',
      namaPembeli: 'Yamal'
    },
    {
      id: 'TRX-002',
      tanggal: '12 May 2025',
      namaObat: 'Amoxicillin',
      jumlah: 1,
      hargaSatuan: 'Rp 25.000',
      totalHarga: 'Rp 25.000',
      namaPembeli: 'Kounde'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditData, setCurrentEditData] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    transactionId: null,
    transactionDetails: ''
  });

  // Function to handle edit transaction
  const handleEdit = (id) => {
    const transactionToEdit = transactions.find(trx => trx.id === id);
    setCurrentEditData(transactionToEdit);
    setIsModalOpen(true);
  };

  // Function to handle delete confirmation
  const handleDeleteClick = (id) => {
    const transaction = transactions.find(trx => trx.id === id);
    setConfirmModal({
      isOpen: true,
      transactionId: id,
      transactionDetails: `${transaction.id} - ${transaction.namaObat} (${transaction.namaPembeli})`
    });
  };

  // Function to confirm delete
  const handleConfirmDelete = () => {
    setTransactions(transactions.filter(trx => trx.id !== confirmModal.transactionId));
    setConfirmModal({ isOpen: false, transactionId: null, transactionDetails: '' });
  };

  // Function to cancel delete
  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, transactionId: null, transactionDetails: '' });
  };

  // Function to handle add or update transaction
  const handleSaveTransaksi = (formData) => {
    if (currentEditData) {
      // Update existing transaction
      setTransactions(transactions.map(trx => 
        trx.id === formData.id ? formData : trx
      ));
    } else {
      // Add new transaction
      const newId = `TRX-${String(transactions.length + 1).padStart(3, '0')}`;
      const newTransaction = {
        ...formData,
        id: newId,
        tanggal: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      };
      setTransactions([...transactions, newTransaction]);
    }
    setIsModalOpen(false);
    setCurrentEditData(null);
  };

  // Function to open modal for adding new transaction
  const handleAddNew = () => {
    setCurrentEditData(null);
    setIsModalOpen(true);
  };

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={onLogout} />
      
      <div className="main-content">
        <div className="header">
          <h1>Transaksi Penjualan</h1>
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
        
        <div className="content-header">
          <h2>Transaksi Penjualan</h2>
          <button className="add-button" onClick={handleAddNew}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Tambah Transaksi
          </button>
        </div>
        
        <div className="table-container">
          <table className="data-table transactions-table">
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tanggal</th>
                <th>Nama Obat</th>
                <th>Jumlah</th>
                <th>Harga Satuan</th>
                <th>Total Harga</th>
                <th>Nama Pembeli</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((trx) => (
                <tr key={trx.id}>
                  <td>{trx.id}</td>
                  <td>{trx.tanggal}</td>
                  <td>{trx.namaObat}</td>
                  <td>{trx.jumlah}</td>
                  <td>{trx.hargaSatuan}</td>
                  <td>{trx.totalHarga}</td>
                  <td>{trx.namaPembeli}</td>
                  <td className="actions">
                    <button 
                      className="edit-button" 
                      onClick={() => handleEdit(trx.id)}
                      title="Edit Transaksi"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button 
                      className="delete-button" 
                      onClick={() => handleDeleteClick(trx.id)}
                      title="Hapus Transaksi"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Transaction Form Modal */}
      <TransaksiForm 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentEditData(null);
        }}
        onSave={handleSaveTransaksi}
        editData={currentEditData}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Hapus Transaksi"
        message={`Apakah Anda yakin ingin menghapus transaksi "${confirmModal.transactionDetails}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default TransaksiPenjualan;