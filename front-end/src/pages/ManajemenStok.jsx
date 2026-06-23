import React, { useEffect, useState } from 'react';
import DashboardHeader from '../components/header/DashboardHeader';
import '../styles/ManajemenStok.css';
import Sidebar from '../components/Sidebar';
import ObatForm from '../components/ObatForm';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';

const API_BASE_URL = '/api/obat';

const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
const parseRupiah = (text) => Number(String(text || '').replace(/[^\d]/g, '')) || 0;

const ManajemenStok = ({ onLogout, authToken = null }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditData, setCurrentEditData] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    medicationCode: null,
    medicationName: ''
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

  const mapDrugToMedication = (item) => ({
    id: item.id,
    kode: `OBT${String(item.id).padStart(3, '0')}`,
    nama: item.name,
    satuan: item.unit,
    stok: item.stock,
    hargaJual: formatRupiah(item.price),
    hargaBeli: formatRupiah(item.purchasePrice || 0),
    kadaluarsa: item.expiredDate ? new Date(item.expiredDate).toISOString().slice(0, 10) : '',
    supplier: item.supplierName || '-',
    supplierId: item.supplierId || null,
    category: item.category || 'BEBAS',
  });

  const fetchDrugs = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await fetch(API_BASE_URL, {
        headers: getAuthHeaders(),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memuat data obat.');
      }

      const mapped = Array.isArray(result.data) ? result.data.map(mapDrugToMedication) : [];
      setMedications(mapped);
    } catch (error) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat memuat obat.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = medications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(medications.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
  const handleConfirmDelete = async () => {
    const target = medications.find((med) => med.kode === confirmModal.medicationCode);
    if (!target?.id) {
      setConfirmModal({ isOpen: false, medicationCode: null, medicationName: '' });
      return;
    }

    try {
      setErrorMessage('');
      const response = await fetch(`${API_BASE_URL}/${target.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus obat.');
      }

      setMedications((prev) => prev.filter((med) => med.id !== target.id));
    } catch (error) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat menghapus obat.');
    } finally {
      setConfirmModal({ isOpen: false, medicationCode: null, medicationName: '' });
    }
  };

  // Function to cancel delete
  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, medicationCode: null, medicationName: '' });
  };

  // Function to handle add or update medication
  const handleSaveObat = async (formData) => {
    try {
      setErrorMessage('');
      const payload = {
        name: formData.nama,
        stock: Number(formData.stok || 0),
        unit: formData.jenis,
        category: formData.kategori,
        purchasePrice: parseRupiah(formData.hargaBeli),
        expiredDate: formData.kadaluarsa || null,
        description: formData.nama,
        supplierId: formData.supplierId ? Number(formData.supplierId) : null,
      };

      if (currentEditData?.id) {
        const response = await fetch(`${API_BASE_URL}/${currentEditData.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(true),
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Gagal memperbarui obat.');
        }

        setMedications((prev) => prev.map((med) => (
          med.id === currentEditData.id ? mapDrugToMedication(result.data) : med
        )));
      } else {
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: getAuthHeaders(true),
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Gagal menambahkan obat.');
        }

        setMedications((prev) => [...prev, mapDrugToMedication(result.data)]);
      }

      setIsModalOpen(false);
      setCurrentEditData(null);
    } catch (error) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat menyimpan obat.');
    }
  };

  // Function to open modal for adding new medication
  const handleAddNew = () => {
    setCurrentEditData(null);
    setIsModalOpen(true);
  };

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={onLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <DashboardHeader authToken={authToken} onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

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
          {errorMessage && <p>{errorMessage}</p>}
          {isLoading && <p>Memuat data obat...</p>}
          <table className="data-table medications-table">
            <thead>
              <tr>
                <th>Kode Obat</th>
                <th>Nama Obat</th>
                <th>Satuan</th>
                <th>Stok</th>
                <th>Harga</th>
                <th>Kadaluarsa</th>
                <th>Supplier</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((med) => (
                <tr key={med.kode}>
                  <td>{med.kode}</td>
                  <td>
                    {med.nama}
                    <div style={{ marginTop: '4px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        backgroundColor: med.category === 'KERAS' ? '#fee2e2' : med.category === 'BEBAS_TERBATAS' ? '#fef3c7' : '#dcfce7',
                        color: med.category === 'KERAS' ? '#dc2626' : med.category === 'BEBAS_TERBATAS' ? '#d97706' : '#16a34a',
                      }}>
                        {med.category === 'KERAS' ? '🔴 Keras' : med.category === 'BEBAS_TERBATAS' ? '🔵 Bebas Terbatas' : '🟢 Bebas'}
                      </span>
                    </div>
                  </td>
                  <td>{med.satuan}</td>
                  <td>{med.stok}</td>
                  <td>
                    <div style={{ fontWeight: 'bold' }}>{med.hargaJual}</div>
                    <div style={{ fontSize: '0.85em', color: 'gray', marginTop: '4px' }}>
                      Beli: {med.hargaBeli}
                    </div>
                  </td>
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
        <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
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
        authToken={authToken}
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