import React, { useState } from 'react';
import '../styles/SupplierPage.css';
import Sidebar from '../components/Sidebar';
import SupplierForm from '../components/SupplierForm';
import ConfirmModal from '../components/ConfirmModal';

const SupplierPage = ({ onLogout }) => {
  // Sample data for suppliers
  const [suppliers, setSuppliers] = useState([
    {
      id: 'SUP001',
      name: 'PT Farmasi Utama',
      address: 'Jl. Sudirman No. 123',
      phone: '021-5551234',
      email: 'contact@farmasiutama.com',
      contactPerson: 'Messi'
    },
    {
      id: 'SUP002',
      name: 'CV Medika Jaya',
      address: 'Jl. Gatot Subroto No. 45',
      phone: '021-5557890',
      email: 'info@medikajaya.com',
      contactPerson: 'Antonella'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditData, setCurrentEditData] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    supplierId: null,
    supplierName: ''
  });

  // Function to handle edit supplier
  const handleEdit = (id) => {
    const supplierToEdit = suppliers.find(sup => sup.id === id);
    setCurrentEditData(supplierToEdit);
    setIsModalOpen(true);
  };

  // Function to handle delete confirmation
  const handleDeleteClick = (id) => {
    const supplier = suppliers.find(sup => sup.id === id);
    setConfirmModal({
      isOpen: true,
      supplierId: id,
      supplierName: supplier.name
    });
  };

  // Function to confirm delete
  const handleConfirmDelete = () => {
    setSuppliers(suppliers.filter(sup => sup.id !== confirmModal.supplierId));
    setConfirmModal({ isOpen: false, supplierId: null, supplierName: '' });
  };

  // Function to cancel delete
  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, supplierId: null, supplierName: '' });
  };

  // Function to handle add or update supplier
  const handleSaveSupplier = (formData) => {
    if (currentEditData) {
      // Update existing supplier
      setSuppliers(suppliers.map(sup => 
        sup.id === formData.id ? formData : sup
      ));
    } else {
      // Add new supplier
      const newSupplier = {
        ...formData,
        id: `SUP${String(suppliers.length + 1).padStart(3, '0')}`
      };
      setSuppliers([...suppliers, newSupplier]);
    }
    setIsModalOpen(false);
    setCurrentEditData(null);
  };

  // Function to open modal for adding new supplier
  const handleAddNew = () => {
    setCurrentEditData(null);
    setIsModalOpen(true);
  };

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={onLogout} />
      
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <h1>Manajemen Supplier</h1>
          <div className="user-info">
            <div className="date">12 May 2025, 07:41:55</div>
            <div className="admin-profile">
              <span>Admin</span>
              <div className="profile-image">👤</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="content-header">
          <h2>Manajemen Supplier</h2>
          <button className="add-button" onClick={handleAddNew}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Tambah Supplier
          </button>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="suppliers-table">
            <thead>
              <tr>
                <th>ID Supplier</th>
                <th>Nama Supplier</th>
                <th>Alamat</th>
                <th>Nomor Telepon</th>
                <th>Email</th>
                <th>Kontak Person</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.id}</td>
                  <td>{supplier.name}</td>
                  <td>{supplier.address}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.contactPerson}</td>
                  <td>
                    <div className="actions">
                      <button 
                        className="edit-button" 
                        onClick={() => handleEdit(supplier.id)}
                        title="Edit Supplier"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                          <path d="m18 2 4 4-12 12H6v-4z"/>
                          <path d="m14.5 5.5 4 4"/>
                        </svg>
                      </button>
                      <button 
                        className="delete-button" 
                        onClick={() => handleDeleteClick(supplier.id)}
                        title="Hapus Supplier"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Form Modal */}
      {isModalOpen && (
        <SupplierForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setCurrentEditData(null);
          }}
          onSave={handleSaveSupplier}
          editData={currentEditData}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Hapus Supplier"
        message={`Apakah Anda yakin ingin menghapus supplier "${confirmModal.supplierName}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default SupplierPage;
