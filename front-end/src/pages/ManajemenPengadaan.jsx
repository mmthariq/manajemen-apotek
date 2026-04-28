import React, { useEffect, useMemo, useState } from 'react';
import DashboardHeader from '../components/header/DashboardHeader';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/ManajemenPengadaan.css';

const SUPPLIER_API_BASE_URL = 'http://localhost:3000/api/suppliers';
const DRUG_API_BASE_URL = 'http://localhost:3000/api/obat';
const PURCHASE_API_BASE_URL = 'http://localhost:3000/api/purchases';

const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

const ManajemenPengadaan = ({ onLogout, userRole = 'admin', currentUser = null, authToken = null }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedDrugId, setSelectedDrugId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('0');
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const headers = getAuthHeaders();
      const [supplierResponse, drugResponse, purchaseResponse] = await Promise.all([
        fetch(SUPPLIER_API_BASE_URL, { headers }),
        fetch(DRUG_API_BASE_URL, { headers }),
        fetch(PURCHASE_API_BASE_URL, { headers }),
      ]);

      const [supplierResult, drugResult, purchaseResult] = await Promise.all([
        supplierResponse.json(),
        drugResponse.json(),
        purchaseResponse.json(),
      ]);

      if (!supplierResponse.ok) {
        throw new Error(supplierResult.message || 'Gagal memuat supplier.');
      }
      if (!drugResponse.ok) {
        throw new Error(drugResult.message || 'Gagal memuat data obat.');
      }
      if (!purchaseResponse.ok) {
        throw new Error(purchaseResult.message || 'Gagal memuat data pengadaan.');
      }

      setSuppliers(Array.isArray(supplierResult.data) ? supplierResult.data : []);
      setDrugs(Array.isArray(drugResult.data) ? drugResult.data : []);
      setPurchases(Array.isArray(purchaseResult.data) ? purchaseResult.data : []);
    } catch (error) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat memuat data pengadaan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const selectedDrug = useMemo(
    () => drugs.find((item) => String(item.id) === String(selectedDrugId)) || null,
    [drugs, selectedDrugId]
  );

  useEffect(() => {
    if (selectedDrug) {
      setUnitPrice(String(Number(selectedDrug.price || 0)));
    }
  }, [selectedDrug]);

  const addToCart = () => {
    const resolvedDrugId = Number(selectedDrugId);
    const resolvedQuantity = Number(quantity);
    const resolvedUnitPrice = Number(unitPrice);

    if (!resolvedDrugId) {
      setErrorMessage('Pilih obat terlebih dahulu.');
      return;
    }
    if (Number.isNaN(resolvedQuantity) || resolvedQuantity <= 0) {
      setErrorMessage('Jumlah harus lebih dari 0.');
      return;
    }
    if (Number.isNaN(resolvedUnitPrice) || resolvedUnitPrice < 0) {
      setErrorMessage('Harga satuan tidak valid.');
      return;
    }

    const drug = drugs.find((item) => item.id === resolvedDrugId);
    if (!drug) {
      setErrorMessage('Obat tidak ditemukan.');
      return;
    }

    setErrorMessage('');

    setCartItems((prev) => {
      const existing = prev.find((item) => item.drugId === resolvedDrugId);
      if (existing) {
        return prev.map((item) => (
          item.drugId === resolvedDrugId
            ? {
              ...item,
              quantity: item.quantity + resolvedQuantity,
              unitPrice: resolvedUnitPrice,
              subtotal: (item.quantity + resolvedQuantity) * resolvedUnitPrice,
            }
            : item
        ));
      }

      return [
        ...prev,
        {
          drugId: resolvedDrugId,
          drugName: drug.name,
          quantity: resolvedQuantity,
          unitPrice: resolvedUnitPrice,
          subtotal: resolvedQuantity * resolvedUnitPrice,
        },
      ];
    });
  };

  const removeCartItem = (drugId) => {
    setCartItems((prev) => prev.filter((item) => item.drugId !== drugId));
  };

  const submitPurchase = async () => {
    try {
      setIsSaving(true);
      setErrorMessage('');
      setMessage('');

      const resolvedSupplierId = Number(selectedSupplierId);
      if (!resolvedSupplierId) {
        throw new Error('Pilih supplier terlebih dahulu.');
      }
      if (cartItems.length === 0) {
        throw new Error('Tambahkan minimal satu item pengadaan.');
      }

      const payload = {
        supplierId: resolvedSupplierId,
        items: cartItems.map((item) => ({
          drugId: item.drugId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const response = await fetch(PURCHASE_API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Gagal menyimpan pengadaan.');
      }

      setMessage('Pengadaan berhasil disimpan dan stok telah diperbarui.');
      setCartItems([]);
      setSelectedDrugId('');
      setQuantity('1');
      setUnitPrice('0');
      await fetchInitialData();
    } catch (error) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat menyimpan pengadaan.');
    } finally {
      setIsSaving(false);
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);

  return (
    <DashboardLayout onLogout={onLogout} userRole={userRole} currentUser={currentUser}>
      <DashboardHeader userRole={userRole} authToken={authToken} />
      <div className="pengadaan-page">
        <div className="pengadaan-header">
          <h1>Manajemen Pengadaan</h1>
          <p>Catat pembelian dari supplier dan otomatis tambah stok obat.</p>
        </div>

        {errorMessage && <div className="pengadaan-alert pengadaan-alert-error">{errorMessage}</div>}
        {message && <div className="pengadaan-alert pengadaan-alert-success">{message}</div>}
        {isLoading && <div className="pengadaan-alert">Memuat data...</div>}

        <div className="pengadaan-grid">
          <section className="pengadaan-card">
            <h2>Form Pengadaan</h2>

            <div className="pengadaan-form-row">
              <label>Supplier</label>
              <select value={selectedSupplierId} onChange={(event) => setSelectedSupplierId(event.target.value)}>
                <option value="">Pilih supplier...</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>

            <div className="pengadaan-form-row">
              <label>Obat</label>
              <select value={selectedDrugId} onChange={(event) => setSelectedDrugId(event.target.value)}>
                <option value="">Pilih obat...</option>
                {drugs.map((drug) => (
                  <option key={drug.id} value={drug.id}>{drug.name} (stok: {drug.stock})</option>
                ))}
              </select>
            </div>

            <div className="pengadaan-inline-row">
              <div className="pengadaan-form-row">
                <label>Jumlah</label>
                <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
              </div>
              <div className="pengadaan-form-row">
                <label>Harga Satuan</label>
                <input type="number" min="0" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} />
              </div>
            </div>

            <div className="pengadaan-actions">
              <button type="button" onClick={addToCart}>Tambah ke Daftar</button>
            </div>
          </section>

          <section className="pengadaan-card">
            <h2>Daftar Item Pengadaan</h2>
            {cartItems.length === 0 ? (
              <p>Belum ada item.</p>
            ) : (
              <table className="pengadaan-table">
                <thead>
                  <tr>
                    <th>Obat</th>
                    <th>Qty</th>
                    <th>Harga</th>
                    <th>Subtotal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.drugId}>
                      <td>{item.drugName}</td>
                      <td>{item.quantity}</td>
                      <td>{formatRupiah(item.unitPrice)}</td>
                      <td>{formatRupiah(item.subtotal)}</td>
                      <td>
                        <button type="button" className="pengadaan-delete" onClick={() => removeCartItem(item.drugId)}>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="pengadaan-total">Total: <strong>{formatRupiah(cartTotal)}</strong></div>

            <div className="pengadaan-actions">
              <button type="button" onClick={submitPurchase} disabled={isSaving || cartItems.length === 0}>
                {isSaving ? 'Menyimpan...' : 'Simpan Pengadaan'}
              </button>
            </div>
          </section>
        </div>

        <section className="pengadaan-card pengadaan-history-card">
          <h2>Riwayat Pengadaan</h2>
          {purchases.length === 0 ? (
            <p>Belum ada riwayat pengadaan.</p>
          ) : (
            <table className="pengadaan-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Supplier</th>
                  <th>Tanggal</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((item) => (
                  <tr key={item.id}>
                    <td>{item.purchaseCode || `#${item.id}`}</td>
                    <td>{item.supplierName || '-'}</td>
                    <td>{item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : '-'}</td>
                    <td>{formatRupiah(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ManajemenPengadaan;
