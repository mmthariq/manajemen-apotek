import React, { useEffect, useState } from 'react';
import useRealtimeClock from '../hooks/useRealtimeClock';
import Sidebar from '../components/Sidebar';
import CustomMedicineForm from '../components/CustomMedicineForm';
import '../styles/ManajemenObatRacikan.css';

const API_BASE_URL = 'http://localhost:3000/api/custom-medicine';

const ManajemenObatRacikan = ({ onLogout, authToken = null }) => {
  const clock = useRealtimeClock();
  const [customMedicines, setCustomMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingKomposisi, setViewingKomposisi] = useState(null);

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

  const fetchCustomMedicines = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await fetch(API_BASE_URL, {
        headers: getAuthHeaders(),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memuat obat racikan.');
      }

      setCustomMedicines(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat memuat obat racikan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomMedicines();
  }, []);

  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (medicine) => {
    setEditingId(medicine.id);
    setEditingData(medicine);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setEditingData(null);
  };

  const handleSave = async (formData) => {
    try {
      const payload = {
        nama: formData.nama,
        harga: Number(formData.harga || 0),
        stok: Number(formData.stok || 0),
        komposisi: formData.komposisi,
      };

      if (editingId) {
        const response = await fetch(`${API_BASE_URL}/${editingId}`, {
          method: 'PUT',
          headers: getAuthHeaders(true),
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Gagal memperbarui obat racikan.');
        }

        setCustomMedicines((prev) => prev.map((med) => (
          med.id === editingId ? { ...med, ...result.data } : med
        )));
        showNotificationMessage('Obat racikan berhasil diperbarui', 'success');
      } else {
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: getAuthHeaders(true),
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Gagal menambahkan obat racikan.');
        }

        setCustomMedicines((prev) => [...prev, result.data]);
        showNotificationMessage('Obat racikan baru berhasil ditambahkan', 'success');
      }
      handleCloseModal();
    } catch (error) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat menyimpan obat racikan.');
      showNotificationMessage(error.message || 'Gagal menyimpan data', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus obat racikan ini?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Gagal menghapus obat racikan.');
        }

        setCustomMedicines((prev) => prev.filter(med => med.id !== id));
        showNotificationMessage('Obat racikan berhasil dihapus', 'success');
      } catch (error) {
        setErrorMessage(error.message || 'Terjadi kesalahan saat menghapus obat racikan.');
        showNotificationMessage(error.message || 'Gagal menghapus data', 'error');
      }
    }
  };

  const filteredMedicines = customMedicines.filter(med =>
    med.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(num);
  };

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={onLogout} />

      <div className="main-content">
        <div className="header">
          <h1>Manajemen Obat Racikan</h1>
          <div className="user-info">
            <span className="date">{clock}</span>
          </div>
        </div>

        <div className="content-section">
          {/* Tools Bar */}
          <div className="tools-bar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Cari obat racikan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7.01,5 5,7.01 5,9.5C5,12 7.01,14 9.5,14C12,14 14,12 14,9.5C14,7.01 12,5 9.5,5Z" />
              </svg>
            </div>
            <button className="btn-add" onClick={handleAddNew}>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              Tambah Obat Racikan
            </button>
          </div>

          {/* Medicines Table */}
          <div className="table-container">
            {errorMessage && <p>{errorMessage}</p>}
            {isLoading && <p>Memuat data obat racikan...</p>}
            {filteredMedicines.length === 0 ? (
              <div className="empty-state">
                <p>Belum ada obat racikan</p>
                <button onClick={handleAddNew} className="btn-secondary">
                  Tambah Obat Racikan Pertama
                </button>
              </div>
            ) : (
              <table className="medicines-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama Obat</th>
                    <th>Harga</th>
                    <th>Stok</th>
                    <th>Komposisi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicines.map((medicine) => (
                    <tr key={medicine.id}>
                      <td className="id-cell">{medicine.id}</td>
                      <td>
                        <span className="medicine-name">{medicine.nama}</span>
                      </td>
                      <td className="price-cell">{formatCurrency(medicine.harga)}</td>
                      <td className="stock-cell">
                        <span className={`stock-badge ${medicine.stok < 10 ? 'low' : ''}`}>
                          {medicine.stok} unit
                        </span>
                      </td>
                      <td className="komposisi-cell">
                        <button
                          className="btn-view-komposisi"
                          title="Lihat Komposisi"
                          onClick={() => setViewingKomposisi(medicine)}
                        >
                          {medicine.komposisi.length} bahan
                        </button>
                      </td>
                      <td className="action-cell">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(medicine)}
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(medicine.id)}
                          title="Hapus"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Info Box */}
          <div className="info-section">
            <div className="info-card">
              <h3>Total Obat Racikan</h3>
              <p className="info-value">{customMedicines.length}</p>
            </div>
            <div className="info-card">
              <h3>Anti Stok</h3>
              <p className="info-value">
                {customMedicines.filter(m => m.stok < 10).length}
              </p>
            </div>
            <div className="info-card">
              <h3>Total Nilai Stok</h3>
              <p className="info-value">
                {formatCurrency(
                  customMedicines.reduce((total, m) => total + (m.harga * m.stok), 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Medicine Form Modal */}
      <CustomMedicineForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        authToken={authToken}
        editData={editingData}
      />

      {/* Modal Lihat Komposisi */}
      {viewingKomposisi && (
        <div className="modal-overlay" onClick={() => setViewingKomposisi(null)}>
          <div className="komposisi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="komposisi-modal-header">
              <h3>Komposisi: {viewingKomposisi.nama}</h3>
              <button className="close-button" onClick={() => setViewingKomposisi(null)}>✕</button>
            </div>
            <div className="komposisi-modal-body">
              {viewingKomposisi.komposisi.length === 0 ? (
                <p className="empty-komposisi">Belum ada komposisi</p>
              ) : (
                <table className="komposisi-detail-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Bahan</th>
                      <th>Jumlah</th>
                      <th>Satuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingKomposisi.komposisi.map((comp, idx) => (
                      <tr key={comp.id || idx}>
                        <td>{idx + 1}</td>
                        <td>{comp.bahan}</td>
                        <td>{comp.jumlah}</td>
                        <td>{comp.satuan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {showNotification && (
        <div className={`notification ${notificationType}`}>
          {notificationMessage}
        </div>
      )}
    </div>
  );
};

export default ManajemenObatRacikan;
