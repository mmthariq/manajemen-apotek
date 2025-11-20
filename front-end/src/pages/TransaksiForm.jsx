import React, { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/TransaksiKasir.css';

const TransaksiKasir = ({ onLogout }) => {
  // State for form input values
  const [selectedObat, setSelectedObat] = useState('');
  const [stokTersedia, setStokTersedia] = useState(100);
  const [jumlah, setJumlah] = useState('');
  const [hargaSatuan, setHargaSatuan] = useState('Rp 5.000');
  const [totalHarga, setTotalHarga] = useState('Rp 0');
  const [cartItems, setCartItems] = useState([]);
  const [namaPembeli, setNamaPembeli] = useState('');
  const [showStruk, setShowStruk] = useState(false);
  
  // Sample medicines data
  const obatList = [
    { id: 1, nama: 'Paracetamol 500mg', harga: 5000, stok: 100 },
    { id: 2, nama: 'Amoxicillin 500mg', harga: 8000, stok: 85 },
    { id: 3, nama: 'Omeprazole 20mg', harga: 10000, stok: 60 },
    { id: 4, nama: 'Simvastatin 10mg', harga: 15000, stok: 45 },
  ];

  // Function to handle medicine selection
  const handleObatChange = (e) => {
    const selected = e.target.value;
    setSelectedObat(selected);
    
    if (selected) {
      const obat = obatList.find(item => item.nama === selected);
      setStokTersedia(obat.stok);
      setHargaSatuan(`Rp ${obat.harga.toLocaleString('id-ID')}`);
    } else {
      setStokTersedia(0);
      setHargaSatuan('Rp 0');
    }
    
    calculateTotal();
  };

  // Function to handle quantity change
  const handleJumlahChange = (e) => {
    const value = e.target.value;
    setJumlah(value);
    
    if (value && selectedObat) {
      const obat = obatList.find(item => item.nama === selectedObat);
      const total = obat.harga * parseInt(value);
      setTotalHarga(`Rp ${total.toLocaleString('id-ID')}`);
    } else {
      setTotalHarga('Rp 0');
    }
  };

  // Function to calculate total price
  const calculateTotal = () => {
    if (jumlah && selectedObat) {
      const obat = obatList.find(item => item.nama === selectedObat);
      const total = obat.harga * parseInt(jumlah);
      setTotalHarga(`Rp ${total.toLocaleString('id-ID')}`);
    }
  };

  // Function to add item to cart
  const handleAddToCart = () => {
    if (!selectedObat || !jumlah || parseInt(jumlah) <= 0) {
      alert('Pilih obat dan masukkan jumlah yang valid');
      return;
    }
    
    const obat = obatList.find(item => item.nama === selectedObat);
    const total = obat.harga * parseInt(jumlah);
    
    const newItem = {
      nama: selectedObat,
      jumlah: parseInt(jumlah),
      hargaSatuan: obat.harga,
      total: total
    };
    
    setCartItems([...cartItems, newItem]);
    
    // Reset form
    setSelectedObat('');
    setJumlah('');
    setHargaSatuan('Rp 0');
    setTotalHarga('Rp 0');
  };

  // Function to calculate cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.total, 0);
  };

  // Function to handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Keranjang belanja kosong');
      return;
    }
    
    if (!namaPembeli) {
      alert('Masukkan nama pembeli');
      return;
    }
    
    setShowStruk(true);
  };

  // Function to handle receipt printing
  const handlePrintStruk = () => {
    // In a real application, this would use a printing library
    // For now, we'll just simulate printing with a window.print()
    window.print();
  };

  // Function to reset transaction
  const handleReset = () => {
    setSelectedObat('');
    setJumlah('');
    setHargaSatuan('Rp 0');
    setTotalHarga('Rp 0');
    setCartItems([]);
    setNamaPembeli('');
    setShowStruk(false);
  };

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) + ', ' + now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-container">
      <Sidebar onLogout={onLogout} />
      
      <div className="main-content">
        <div className="header">
          <h1>Transaksi Penjualan</h1>
          <div className="user-info">
            <span className="date">12 May 2025, 07:41:55</span>
            <div className="admin-profile">
              <span>Kasir</span>
              <div className="profile-image">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="transaksi-container">
          <div className="transaksi-form">
            <h2>Input Penjualan</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Pilih Obat</label>
                <div className="select-wrapper">
                  <select
                    value={selectedObat}
                    onChange={handleObatChange}
                  >
                    <option value="">Pilih obat...</option>
                    {obatList.map(obat => (
                      <option key={obat.id} value={obat.nama}>
                        {obat.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Stok Tersedia</label>
                <input
                  type="text"
                  value={stokTersedia}
                  readOnly
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Jumlah</label>
                <input
                  type="number"
                  value={jumlah}
                  onChange={handleJumlahChange}
                  min="1"
                  max={stokTersedia}
                />
              </div>
              <div className="form-group">
                <label>Harga Satuan</label>
                <input
                  type="text"
                  value={hargaSatuan}
                  readOnly
                />
              </div>
            </div>
            <div className="form-group">
              <label>Total Harga</label>
              <input
                type="text"
                value={totalHarga}
                readOnly
              />
            </div>
            <div className="form-actions">
              <button 
                className="button button-secondary"
                onClick={handleReset}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
                Batal
              </button>
              <button 
                className="button button-primary"
                onClick={handleAddToCart}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                </svg>
                Simpan
              </button>
            </div>
          </div>
          
          <div className="cart-section">
            <h2>Keranjang Belanja</h2>
            {cartItems.length > 0 ? (
              <>
                <div className="cart-items">
                  <table>
                    <thead>
                      <tr>
                        <th>Nama Obat</th>
                        <th>Jumlah</th>
                        <th>Harga</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.nama}</td>
                          <td>{item.jumlah}</td>
                          <td>Rp {item.hargaSatuan.toLocaleString('id-ID')}</td>
                          <td>Rp {item.total.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="cart-total">
                  <p>Total: <strong>Rp {getCartTotal().toLocaleString('id-ID')}</strong></p>
                </div>
                <div className="cart-checkout">
                  <div className="form-group">
                    <label>Nama Pembeli</label>
                    <input
                      type="text"
                      value={namaPembeli}
                      onChange={(e) => setNamaPembeli(e.target.value)}
                      placeholder="Masukkan nama pembeli"
                    />
                  </div>
                  <button 
                    className="button button-primary checkout-button"
                    onClick={handleCheckout}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                    </svg>
                    Checkout
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-cart">
                <p>Keranjang belanja kosong</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Struk Penjualan Modal */}
      {showStruk && (
        <div className="struk-overlay">
          <div className="struk-container">
            <div className="struk-header">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M3,22L4.5,20.5L6,22L7.5,20.5L9,22L10.5,20.5L12,22L13.5,20.5L15,22L16.5,20.5L18,22L19.5,20.5L21,22V2L19.5,3.5L18,2L16.5,3.5L15,2L13.5,3.5L12,2L10.5,3.5L9,2L7.5,3.5L6,2L4.5,3.5L3,2V22Z" />
              </svg>
              <h3>Struk Penjualan</h3>
            </div>
            <div className="struk-content">
              {cartItems.map((item, index) => (
                <div className="struk-item" key={index}>
                  <p>{item.nama}</p>
                  <p>{item.jumlah}x @ Rp {item.hargaSatuan.toLocaleString('id-ID')}</p>
                </div>
              ))}
              <div className="struk-total">
                <p>Total</p>
                <p>Rp {getCartTotal().toLocaleString('id-ID')}</p>
              </div>
              <div className="struk-info">
                <p>Pembeli: {namaPembeli}</p>
                <p>{getCurrentDateTime()}</p>
              </div>
            </div>
            <div className="struk-actions">
              <button 
                className="button button-secondary"
                onClick={() => setShowStruk(false)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
                Tutup
              </button>
              <button 
                className="button button-primary"
                onClick={handlePrintStruk}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z" />
                </svg>
                Cetak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransaksiKasir;
