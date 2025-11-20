const express = require('express');
const drugController = require('../controllers/drugController'); // Akan dibuat
// const authMiddleware = require('../middlewares/authMiddleware'); // Akan dibuat
// const { validateCreateDrug, validateUpdateDrug } = require('../middlewares/validationMiddleware'); // Akan dibuat

const router = express.Router();

// GET /api/obat - Mendapatkan daftar seluruh obat
router.get(
  '/',
  // authMiddleware.protect, // Semua pengguna terautentikasi bisa lihat
  drugController.getAllDrugs
);

// POST /api/obat - Menambahkan data obat baru
router.post(
  '/',
  // authMiddleware.protect,
  // authMiddleware.restrictTo('admin', 'apoteker'), // Hanya admin atau apoteker
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
  // authMiddleware.protect,
  // authMiddleware.restrictTo('admin', 'apoteker'),
  // validateUpdateDrug,
  drugController.updateDrug
);

// DELETE /api/obat/{idObat} - Menghapus data obat berdasarkan ID
router.delete(
  '/:idObat',
  // authMiddleware.protect,
  // authMiddleware.restrictTo('admin', 'apoteker'),
  drugController.deleteDrug
);

module.exports = router;