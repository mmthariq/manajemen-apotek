const express = require('express');
const drugController = require('../controllers/drugController'); // Akan dibuat
const authMiddleware = require('../middlewares/authMiddleware');
// const { validateCreateDrug, validateUpdateDrug } = require('../middlewares/validationMiddleware'); // Akan dibuat

const router = express.Router();

router.use(authMiddleware.protect);

// GET /api/obat - Mendapatkan daftar seluruh obat
router.get(
  '/',
  // authMiddleware.protect, // Semua pengguna terautentikasi bisa lihat
  drugController.getAllDrugs
);

// POST /api/obat - Menambahkan data obat baru
router.post(
  '/',
  authMiddleware.restrictTo('ADMIN', 'KASIR'),
  // validateCreateDrug,
  drugController.createDrug
);

// GET /api/obat/{idObat} - Mendapatkan detail satu obat berdasarkan ID
router.get(
  '/:idObat',
  // authMiddleware.protect,
  drugController.getDrugById
);

// PUT /api/obat/{idObat} - Memperbarui data obat berdasarkan ID
router.put(
  '/:idObat',
  authMiddleware.restrictTo('ADMIN', 'KASIR'),
  // validateUpdateDrug,
  drugController.updateDrug
);

// DELETE /api/obat/{idObat} - Menghapus data obat berdasarkan ID
router.delete(
  '/:idObat',
  authMiddleware.restrictTo('ADMIN', 'KASIR'),
  drugController.deleteDrug
);

module.exports = router;