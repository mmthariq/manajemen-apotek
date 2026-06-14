import React, { useState, useEffect } from 'react';
import '../styles/ObatForm.css';

const SUPPLIER_API_URL = 'http://localhost:3000/api/suppliers';

const ObatForm = ({ isOpen, onClose, onSave, editData, authToken = null }) => {
  const initialFormData = {
    kode: '',
    nama: '',
    jenis: 'Tablet',
    kategori: 'BEBAS',
    stok: 0,
    harga: '',
    kadaluarsa: '',
    supplierId: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const isEditing = !!editData;

  // Fetch daftar supplier saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        jenis: editData.satuan || editData.jenis || 'Tablet',
        kategori: editData.category || editData.kategori || 'BEBAS',
        harga: editData.hargaJual || editData.harga || '',
        supplierId: editData.supplierId || ''
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editData]);

  const fetchSuppliers = async () => {
    try {
      setIsLoadingSuppliers(true);
      const headers = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      const response = await fetch(SUPPLIER_API_URL, { headers });
      const result = await response.json();
      if (response.ok && Array.isArray(result.data)) {
        setSuppliers(result.data);
      }
    } catch (error) {
      console.error('Gagal memuat data supplier:', error);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'stok' ? parseInt(value, 10) || 0 : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Obat' : 'Tambah Obat Baru'}</h2>
          <button className="close-button" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="kode">Kode Obat</label>
            <input
              type="text"
              id="kode"
              name="kode"
              value={formData.kode}
              onChange={handleChange}
              disabled={isEditing}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="nama">Nama Obat</label>
            <input
              type="text"
              id="nama"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="kategori">Kategori Obat</label>
            <select
              id="kategori"
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              required
            >
              <option value="BEBAS">Bebas</option>
              <option value="BEBAS_TERBATAS">Bebas Terbatas</option>
              <option value="KERAS">Keras</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="jenis">Jenis</label>
              <select
                id="jenis"
                name="jenis"
                value={formData.jenis}
                onChange={handleChange}
                required
              >
                <option value="Tablet">Tablet</option>
                <option value="Kapsul">Kapsul</option>
                <option value="Sirup">Sirup</option>
                <option value="Salep">Salep</option>
                <option value="Injeksi">Injeksi</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="stok">Stok</label>
              <input
                type="number"
                id="stok"
                name="stok"
                value={formData.stok}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="harga">Harga</label>
              <input
                type="text"
                id="harga"
                name="harga"
                value={formData.harga}
                onChange={handleChange}
                placeholder="Rp 0"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="kadaluarsa">Tanggal Kadaluarsa</label>
              <input
                type="date"
                id="kadaluarsa"
                name="kadaluarsa"
                value={formData.kadaluarsa}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="supplierId">Supplier</label>
            <select
              id="supplierId"
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              required
            >
              <option value="">
                {isLoadingSuppliers ? 'Memuat supplier...' : '-- Pilih Supplier --'}
              </option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="save-button">
              {isEditing ? 'Simpan Perubahan' : 'Tambah Obat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ObatForm;