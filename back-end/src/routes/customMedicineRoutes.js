const express = require('express');
const router = express.Router();
const customMedicineController = require('../controllers/customMedicineController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.protect);

// Rute untuk mendapatkan semua obat racikan
router.get('/', customMedicineController.getAllCustomMedicines);

// Rute untuk membuat obat racikan baru
router.post('/', authMiddleware.restrictTo('ADMIN', 'KASIR'), customMedicineController.createCustomMedicine);

// Rute untuk mendapatkan obat racikan berdasarkan ID
router.get('/:medicineId', customMedicineController.getCustomMedicineById);

// Rute untuk memperbarui obat racikan
router.put('/:medicineId', authMiddleware.restrictTo('ADMIN', 'KASIR'), customMedicineController.updateCustomMedicine);

// Rute untuk menghapus obat racikan
router.delete('/:medicineId', authMiddleware.restrictTo('ADMIN', 'KASIR'), customMedicineController.deleteCustomMedicine);

// Rute untuk mencatat transaksi obat racikan
router.post('/:medicineId/transaction', authMiddleware.restrictTo('ADMIN', 'KASIR'), customMedicineController.recordCustomMedicineTransaction);

module.exports = router;
