import React, { useState, useEffect } from 'react';
import '../styles/ObatForm.css';

const ObatForm = ({ isOpen, onClose, onSave, editData }) => {
  const initialFormData = {
    kode: '',
    nama: '',
    jenis: 'Tablet',
    stok: 0,
    harga: '',
    kadaluarsa: '',
    supplier: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const isEditing = !!editData;

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData(initialFormData);
    }
  }, [editData]);

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
            <label htmlFor="supplier">Supplier</label>
            <input
              type="text"
              id="supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              required
            />
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