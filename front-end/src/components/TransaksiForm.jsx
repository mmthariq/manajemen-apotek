import React, { useState, useEffect } from 'react';
import '../styles/TransaksiForm.css';

const DRUG_API_BASE_URL = 'http://localhost:3000/api/obat';

const TransaksiForm = ({ isOpen, onClose, onSave, editData }) => {
  const initialFormData = {
    namaObat: '',
    jumlah: 1,
    hargaSatuan: '',
    totalHarga: '',
    namaPembeli: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [availableMeds, setAvailableMeds] = useState([]);
  
  const isEditing = !!editData;

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData(initialFormData);
    }
  }, [editData]);

  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const response = await fetch(DRUG_API_BASE_URL);
        const result = await response.json();

        if (!response.ok) {
          return;
        }

        const mapped = Array.isArray(result.data)
          ? result.data.map((item) => ({
            nama: item.name,
            harga: `Rp ${Number(item.price || 0).toLocaleString('id-ID')}`,
          }))
          : [];

        setAvailableMeds(mapped);
      } catch (error) {
        setAvailableMeds([]);
      }
    };

    fetchMeds();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'namaObat') {
      const selectedMed = availableMeds.find(med => med.nama === value);
      if (selectedMed) {
        const hargaSatuan = selectedMed.harga;
        const jumlah = formData.jumlah || 1;
        const hargaNumeric = parseInt(hargaSatuan.replace(/[^\d]/g, ''));
        const totalHarga = `Rp ${(hargaNumeric * jumlah).toLocaleString('id-ID')}`;
        
        setFormData({
          ...formData,
          namaObat: value,
          hargaSatuan,
          totalHarga
        });
      }
    } else if (name === 'jumlah') {
      const jumlah = parseInt(value) || 0;
      if (formData.hargaSatuan) {
        const hargaNumeric = parseInt(formData.hargaSatuan.replace(/[^\d]/g, ''));
        const totalHarga = `Rp ${(hargaNumeric * jumlah).toLocaleString('id-ID')}`;
        
        setFormData({
          ...formData,
          jumlah,
          totalHarga
        });
      } else {
        setFormData({
          ...formData,
          jumlah
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
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
          <h2>{isEditing ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</h2>
          <button className="close-button" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="namaObat">Nama Obat</label>
            <select
              id="namaObat"
              name="namaObat"
              value={formData.namaObat}
              onChange={handleChange}
              required
            >
              <option value="">Pilih Obat</option>
              {availableMeds.map((med, index) => (
                <option key={index} value={med.nama}>{med.nama}</option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="jumlah">Jumlah</label>
              <input
                type="number"
                id="jumlah"
                name="jumlah"
                value={formData.jumlah}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="hargaSatuan">Harga Satuan</label>
              <input
                type="text"
                id="hargaSatuan"
                name="hargaSatuan"
                value={formData.hargaSatuan}
                readOnly
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="totalHarga">Total Harga</label>
              <input
                type="text"
                id="totalHarga"
                name="totalHarga"
                value={formData.totalHarga}
                readOnly
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="namaPembeli">Nama Pembeli</label>
              <input
                type="text"
                id="namaPembeli"
                name="namaPembeli"
                value={formData.namaPembeli}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="save-button">
              {isEditing ? 'Simpan Perubahan' : 'Tambah Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransaksiForm;
