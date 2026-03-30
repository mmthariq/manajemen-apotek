const express = require('express');
const router = express.Router();
const customMedicineController = require('../controllers/customMedicineController');

// Rute untuk mendapatkan semua obat racikan
router.get('/', customMedicineController.getAllCustomMedicines);

// Rute untuk membuat obat racikan baru
router.post('/', customMedicineController.createCustomMedicine);

// Rute untuk mendapatkan obat racikan berdasarkan ID
router.get('/:medicineId', customMedicineController.getCustomMedicineById);

// Rute untuk memperbarui obat racikan
router.put('/:medicineId', customMedicineController.updateCustomMedicine);

// Rute untuk menghapus obat racikan
router.delete('/:medicineId', customMedicineController.deleteCustomMedicine);

// Rute untuk mencatat transaksi obat racikan
router.post('/:medicineId/transaction', customMedicineController.recordCustomMedicineTransaction);

module.exports = router;
