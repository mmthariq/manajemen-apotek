import React, { useState } from 'react';
import '../styles/ManajemenStok.css';
import Sidebar from '../components/Sidebar';
import ObatForm from '../components/ObatForm';
import ConfirmModal from '../components/ConfirmModal';

const ManajemenStok = ({ onLogout }) => {
  // Sample data for medications
  const [medications, setMedications] = useState([
    {
      kode: 'OBT001',
      nama: 'Paracetamol',
      jenis: 'Tablet',
      stok: 500,
      harga: 'Rp 10.000',
      kadaluarsa: '2025-12-31',
      supplier: 'PT Kimia Farma'
    },
    {
      kode: 'OBT002',
      nama: 'Amoxicillin',
      jenis: 'Kapsul',
      stok: 200,
      harga: 'Rp 25.000',
      kadaluarsa: '2025-10-15',
      supplier: 'PT Kalbe Farma'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditData, setCurrentEditData] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    medicationCode: null,
    medicationName: ''
  });

  // Function to handle edit medication
  const handleEdit = (kode) => {
    const medicationToEdit = medications.find(med => med.kode === kode);
    setCurrentEditData(medicationToEdit);
    setIsModalOpen(true);
  };

  // Function to handle delete confirmation
  const handleDeleteClick = (kode) => {
    const medication = medications.find(med => med.kode === kode);
    setConfirmModal({
      isOpen: true,
      medicationCode: kode,
      medicationName: medication.nama
    });
  };

  // Function to confirm delete
  const handleConfirmDelete = () => {
    setMedications(medications.filter(med => med.kode !== confirmModal.medicationCode));
    setConfirmModal({ isOpen: false, medicationCode: null, medicationName: '' });
  };

  // Function to cancel delete
  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, medicationCode: null, medicationName: '' });
  };

  // Function to handle add or update medication
  const handleSaveObat = (formData) => {
    if (currentEditData) {
      // Update existing medication
      setMedications(medications.map(med => 
        med.kode === formData.kode ? formData : med
      ));
    } else {
      // Add new medication
      setMedications([...medications, formData]);
    }
    setIsModalOpen(false);
    setCurrentEditData(null);
  };

  // Function to open modal for adding new medication
  const handleAddNew = () => {
    setCurrentEditData(null);
    setIsModalOpen(true);
  };

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={onLogout} />
      
      <div className="main-content">
        <div className="header">
          <h1>Manajemen Stok Obat</h1>
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
          <h2>Manajemen Stok Obat</h2>
          <button className="add-button" onClick={handleAddNew}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Tambah Obat
          </button>
        </div>
        
        <div className="table-container">
          <table className="data-table medications-table">
            <thead>
              <tr>
                <th>Kode Obat</th>
                <th>Nama Obat</th>
                <th>Jenis</th>
                <th>Stok</th>
                <th>Harga</th>
                <th>Kadaluarsa</th>
                <th>Supplier</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {medications.map((med) => (
                <tr key={med.kode}>
                  <td>{med.kode}</td>
                  <td>{med.nama}</td>
                  <td>{med.jenis}</td>
                  <td>{med.stok}</td>
                  <td>{med.harga}</td>
                  <td>{med.kadaluarsa}</td>
                  <td>{med.supplier}</td>
                  <td className="actions">
                    <button 
                      className="edit-button" 
                      onClick={() => handleEdit(med.kode)}
                      title="Edit Obat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button 
                      className="delete-button" 
                      onClick={() => handleDeleteClick(med.kode)}
                      title="Hapus Obat"
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
      
      {/* Obat Form Modal */}
      <ObatForm 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentEditData(null);
        }}
        onSave={handleSaveObat}
        editData={currentEditData}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Hapus Obat"
        message={`Apakah Anda yakin ingin menghapus obat "${confirmModal.medicationName}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default ManajemenStok;