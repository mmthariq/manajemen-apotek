/**
 * Konfigurasi margin harga jual-beli Apotek Pemuda.
 *
 * Semua logika penentuan harga jual otomatis (dari harga beli/purchasePrice)
 * harus menggunakan konstanta ini agar konsisten di seluruh aplikasi.
 */

const MARGIN_PERCENTAGE = 0.15; // 15%
const MARGIN_MULTIPLIER = 1 + MARGIN_PERCENTAGE; // 1.15

/**
 * Hitung harga jual dari harga beli berdasarkan margin yang ditentukan.
 * @param {number} purchasePrice - Harga beli (harga pokok)
 * @returns {number} Harga jual (dibulatkan 2 desimal)
 */
const calculateSellingPrice = (purchasePrice) => {
  return Math.round(Number(purchasePrice) * MARGIN_MULTIPLIER * 100) / 100;
};

module.exports = {
  MARGIN_PERCENTAGE,
  MARGIN_MULTIPLIER,
  calculateSellingPrice,
};
