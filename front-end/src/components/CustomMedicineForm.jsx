import React, { useState, useEffect } from 'react';
import '../styles/CustomMedicineForm.css';

const DRUG_API_URL = 'http://localhost:3000/api/obat';

const CustomMedicineForm = ({ isOpen, onClose, onSave, authToken, editData }) => {
  const initialFormData = {
    nama: '',
    deskripsi: '',
    harga: '',
    komposisi: [{ id: 1, drugId: '', bahan: '', jumlah: '', satuan: 'tablet' }],
    petunjuk: '',
    stok: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [drugList, setDrugList] = useState([]);
  const [isLoadingDrugs, setIsLoadingDrugs] = useState(false);

  const satuan = ['tablet', 'kapsul', 'mL', 'sendok', 'gram'];

  // Fetch daftar obat dari database saat modal dibuka
  useEffect(() => {
    if (!isOpen) return;

    const fetchDrugs = async () => {
      try {
        setIsLoadingDrugs(true);
        const headers = {};
        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }

        const response = await fetch(DRUG_API_URL, { headers });
        const result = await response.json();

        if (response.ok && Array.isArray(result.data)) {
          setDrugList(
            result.data.map((item) => ({
              id: item.id,
              name: item.name,
              unit: item.unit || '',
              stock: item.stock || 0,
            }))
          );
        }
      } catch (error) {
        console.error('Gagal memuat daftar obat:', error);
      } finally {
        setIsLoadingDrugs(false);
      }
    };

    fetchDrugs();
  }, [isOpen, authToken]);

  // Populate form ketika edit
  useEffect(() => {
    if (!isOpen) return;

    if (editData) {
      setFormData({
        nama: editData.nama || '',
        deskripsi: editData.deskripsi || '',
        harga: editData.harga ?? '',
        stok: editData.stok ?? '',
        petunjuk: editData.petunjuk || '',
        komposisi: Array.isArray(editData.komposisi) && editData.komposisi.length > 0
          ? editData.komposisi.map((k, idx) => ({
              id: k.id || idx + 1,
              drugId: k.drugId || '',
              bahan: k.bahan || '',
              jumlah: k.jumlah ?? k.quantity ?? '',
              satuan: k.satuan || k.unit || 'tablet',
            }))
          : [{ id: 1, drugId: '', bahan: '', jumlah: '', satuan: 'tablet' }],
      });
    } else {
      setFormData(initialFormData);
    }

    setErrors({});
  }, [isOpen, editData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleKomposisiChange = (index, field, value) => {
    const newKomposisi = [...formData.komposisi];

    if (field === 'drugId') {
      // Ketika user pilih obat dari dropdown, otomatis isi nama bahan
      const selectedDrug = drugList.find((d) => d.id === Number(value));
      newKomposisi[index].drugId = value ? Number(value) : '';
      newKomposisi[index].bahan = selectedDrug ? selectedDrug.name : '';
    } else {
      newKomposisi[index][field] = value;
    }

    setFormData({
      ...formData,
      komposisi: newKomposisi
    });
  };

  const addKomposisi = () => {
    const newId = Math.max(...formData.komposisi.map(k => k.id), 0) + 1;
    setFormData({
      ...formData,
      komposisi: [...formData.komposisi, { id: newId, drugId: '', bahan: '', jumlah: '', satuan: 'tablet' }]
    });
  };

  const removeKomposisi = (index) => {
    if (formData.komposisi.length > 1) {
      setFormData({
        ...formData,
        komposisi: formData.komposisi.filter((_, i) => i !== index)
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama obat harus diisi';
    }

    if (!formData.harga || isNaN(formData.harga) || parseInt(formData.harga) <= 0) {
      newErrors.harga = 'Harga harus berupa angka positif';
    }

    // Validasi komposisi
    formData.komposisi.every((k, i) => {
      if (!k.drugId || !k.jumlah || !k.satuan) {
        if (!newErrors.komposisi) newErrors.komposisi = [];
        newErrors.komposisi[i] = 'Semua field di komposisi harus diisi';
        return false;
      }
      return true;
    });

    if (formData.komposisi.length === 0) {
      newErrors.komposisiLength = 'Minimal 1 bahan dalam komposisi';
    }

    if (!formData.petunjuk.trim()) {
      newErrors.petunjuk = 'Petunjuk pemakaian harus diisi';
    }

    if (!formData.stok || isNaN(formData.stok) || parseInt(formData.stok) < 0) {
      newErrors.stok = 'Stok harus berupa angka';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Kirim data dengan drugId agar backend tidak perlu lookup by name
    const payload = {
      ...formData,
      komposisi: formData.komposisi.map((k) => ({
        drugId: Number(k.drugId),
        bahan: k.bahan,
        jumlah: Number(k.jumlah),
        satuan: k.satuan,
      })),
    };

    onSave(payload);
    setFormData(initialFormData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content custom-medicine-modal">
        <div className="modal-header">
          <h2>{editData ? 'Edit Obat Racikan' : 'Buat Obat Racikan Baru'}</h2>
          <button className="close-button" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="custom-medicine-form">
          {/* Informasi Dasar */}
          <div className="form-section">
            <h3>Informasi Dasar</h3>

            <div className="form-group">
              <label htmlFor="nama">Nama Obat Racikan *</label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                placeholder="Contoh: Racikan Penurun Panas"
                className={errors.nama ? 'input-error' : ''}
              />
              {errors.nama && <span className="error-message">{errors.nama}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="harga">Harga (Rp) *</label>
                <input
                  type="number"
                  id="harga"
                  name="harga"
                  value={formData.harga}
                  onChange={handleInputChange}
                  placeholder="50000"
                  className={errors.harga ? 'input-error' : ''}
                />
                {errors.harga && <span className="error-message">{errors.harga}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="stok">Stok *</label>
                <input
                  type="number"
                  id="stok"
                  name="stok"
                  value={formData.stok}
                  onChange={handleInputChange}
                  placeholder="0"
                  className={errors.stok ? 'input-error' : ''}
                />
                {errors.stok && <span className="error-message">{errors.stok}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="deskripsi">Deskripsi</label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                placeholder="Deskripsi singkat tentang obat racikan ini"
                rows="2"
              />
            </div>
          </div>

          {/* Komposisi Bahan */}
          <div className="form-section">
            <div className="section-header">
              <h3>Komposisi Bahan</h3>
              <button
                type="button"
                className="add-komposisi-btn"
                onClick={addKomposisi}
              >
                + Tambah Bahan
              </button>
            </div>

            {errors.komposisiLength && (
              <span className="error-message">{errors.komposisiLength}</span>
            )}

            <div className="komposisi-list">
              {formData.komposisi.map((item, index) => (
                <div key={item.id} className="komposisi-item">
                  <div className="item-number">Bahan #{index + 1}</div>

                  <div className="form-row">
                    <div className="form-group full">
                      <label>Pilih Obat *</label>
                      <select
                        value={item.drugId}
                        onChange={(e) => handleKomposisiChange(index, 'drugId', e.target.value)}
                        className={errors.komposisi?.[index] ? 'input-error' : ''}
                        disabled={isLoadingDrugs}
                      >
                        <option value="">
                          {isLoadingDrugs ? 'Memuat daftar obat...' : '-- Pilih Obat --'}
                        </option>
                        {drugList.map((drug) => (
                          <option key={drug.id} value={drug.id}>
                            {drug.name} (Stok: {drug.stock} {drug.unit})
                          </option>
                        ))}
                      </select>
                      {errors.komposisi?.[index] && (
                        <span className="error-message">{errors.komposisi[index]}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Jumlah *</label>
                      <input
                        type="number"
                        value={item.jumlah}
                        onChange={(e) => handleKomposisiChange(index, 'jumlah', e.target.value)}
                        placeholder="2"
                        min="1"
                        className={errors.komposisi?.[index] ? 'input-error' : ''}
                      />
                    </div>

                    <div className="form-group">
                      <label>Satuan *</label>
                      <select
                        value={item.satuan}
                        onChange={(e) => handleKomposisiChange(index, 'satuan', e.target.value)}
                        className={errors.komposisi?.[index] ? 'input-error' : ''}
                      >
                        {satuan.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {formData.komposisi.length > 1 && (
                      <button
                        type="button"
                        className="remove-komposisi-btn"
                        onClick={() => removeKomposisi(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Petunjuk Pemakaian */}
          <div className="form-section">
            <h3>Petunjuk Pemakaian</h3>
            <div className="form-group">
              <label htmlFor="petunjuk">Cara Pemakaian *</label>
              <textarea
                id="petunjuk"
                name="petunjuk"
                value={formData.petunjuk}
                onChange={handleInputChange}
                placeholder="Contoh: Diminum 3x sehari setelah makan"
                rows="3"
                className={errors.petunjuk ? 'input-error' : ''}
              />
              {errors.petunjuk && <span className="error-message">{errors.petunjuk}</span>}
            </div>
          </div>

          {/* Tombol */}
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="submit-button">
              {editData ? 'Simpan Perubahan' : 'Simpan Obat Racikan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomMedicineForm;
