import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import CustomMedicineForm from '../components/CustomMedicineForm';
import '../styles/ManajemenObatRacikan.css';

const ManajemenObatRacikan = ({ onLogout }) => {
  const [customMedicines, setCustomMedicines] = useState([
    {
      id: 1,
      nama: 'Racikan Penurun Panas',
      kategori: 'Racikan',
      harga: 45000,
      stok: 20,
      komposisi: [
        { bahan: 'Paracetamol 500mg', jumlah: 2, satuan: 'tablet' },
        { bahan: 'Ibuprofen 200mg', jumlah: 1, satuan: 'tablet' }
      ]
    },
    {
      id: 2,
      nama: 'Racikan Batuk Kering',
      kategori: 'Racikan',
      harga: 35000,
      stok: 15,
      komposisi: [
        { bahan: 'Codein 5mg', jumlah: 1, satuan: 'tablet' },
        { bahan: 'GG Formula', jumlah: 2, satuan: 'tablet' }
      ]
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [searchTerm, setSearchTerm] = useState('');

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
    setIsModalOpen(true);
  };

  const handleEdit = (medicine) => {
    setEditingId(medicine.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = (formData) => {
    if (editingId) {
      setCustomMedicines(customMedicines.map(med =>
        med.id === editingId
          ? { ...med, ...formData }
          : med
      ));
      showNotificationMessage('Obat racikan berhasil diperbarui', 'success');
    } else {
      const newMedicine = {
        id: Math.max(...customMedicines.map(m => m.id), 0) + 1,
        ...formData
      };
      setCustomMedicines([...customMedicines, newMedicine]);
      showNotificationMessage('Obat racikan baru berhasil ditambahkan', 'success');
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus obat racikan ini?')) {
      setCustomMedicines(customMedicines.filter(med => med.id !== id));
      showNotificationMessage('Obat racikan berhasil dihapus', 'success');
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
            <span className="date">{new Date().toLocaleDateString('id-ID')}</span>
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
                        <button className="btn-view-komposisi" title="Lihat Komposisi">
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
      />

      {showNotification && (
        <div className={`notification ${notificationType}`}>
          {notificationMessage}
        </div>
      )}
    </div>
  );
};

export default ManajemenObatRacikan;
