import React, { useEffect, useState } from 'react';
import DashboardHeader from '../components/header/DashboardHeader';
import '../styles/SupplierPage.css';
import Sidebar from '../components/Sidebar';
import SupplierForm from '../components/SupplierForm';
import ConfirmModal from '../components/ConfirmModal';

const API_BASE_URL = 'http://localhost:3000/api/suppliers';

const SupplierPage = ({ onLogout, authToken = null }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditData, setCurrentEditData] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    supplierId: null,
    supplierName: ''
  });

  const getAuthHeaders = (includeJsonContentType = false) => {
    const headers = {};
    if (includeJsonContentType) {
      headers['Content-Type'] = 'application/json';
    }

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    return headers;
  };

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await fetch(API_BASE_URL, {
        headers: getAuthHeaders(),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memuat data supplier.');
      }

      setSuppliers(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat memuat supplier.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

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
  const handleConfirmDelete = async () => {
    try {
      setErrorMessage('');
      const response = await fetch(`${API_BASE_URL}/${confirmModal.supplierId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus supplier.');
      }

      setSuppliers((prev) => prev.filter(sup => sup.id !== confirmModal.supplierId));
    } catch (error) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat menghapus supplier.');
    } finally {
      setConfirmModal({ isOpen: false, supplierId: null, supplierName: '' });
    }
  };

  // Function to cancel delete
  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, supplierId: null, supplierName: '' });
  };

  // Function to handle add or update supplier
  const handleSaveSupplier = async (formData) => {
    try {
      setErrorMessage('');
      const payload = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email || null,
        contactPerson: formData.contactPerson,
      };

      if (currentEditData) {
        const response = await fetch(`${API_BASE_URL}/${currentEditData.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(true),
          body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Gagal memperbarui supplier.');
        }

        setSuppliers((prev) => prev.map((sup) => (
          sup.id === currentEditData.id ? result.data : sup
        )));
      } else {
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: getAuthHeaders(true),
          body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Gagal menambahkan supplier.');
        }

        setSuppliers((prev) => [...prev, result.data]);
      }

      setIsModalOpen(false);
      setCurrentEditData(null);
    } catch (error) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat menyimpan supplier.');
    }
  };

  // Function to open modal for adding new supplier
  const handleAddNew = () => {
    setCurrentEditData(null);
    setIsModalOpen(true);
  };

  return (
    <div className="dashboard-container supplier-page">
      <Sidebar onLogout={onLogout} />
      
      <div className="main-content">
        <DashboardHeader authToken={authToken} />

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
          {errorMessage && <p>{errorMessage}</p>}
          {isLoading && <p>Memuat data supplier...</p>}
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
                  <td>{supplier.email || '-'}</td>
                  <td>{supplier.contactPerson}</td>
                  <td>
                    <div className="actions">
                      <button 
                        className="edit-button" 
                        onClick={() => handleEdit(supplier.id)}
                        title="Edit Supplier"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button 
                        className="delete-button" 
                        onClick={() => handleDeleteClick(supplier.id)}
                        title="Hapus Supplier"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
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
