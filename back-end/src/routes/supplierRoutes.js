const express = require('express');
const supplierController = require('../controllers/supplierController'); // Akan dibuat
const authMiddleware = require('../middlewares/authMiddleware');
// const { validateCreateSupplier } = require('../middlewares/validationMiddleware'); // Akan dibuat

const router = express.Router();

router.use(authMiddleware.protect);

// GET /api/suppliers - Mendapatkan daftar seluruh supplier
router.get(
  '/',
  authMiddleware.restrictTo('ADMIN', 'KASIR', 'OWNER'),
  supplierController.getAllSuppliers
);

// POST /api/suppliers - Menambahkan supplier baru
router.post(
  '/',
  authMiddleware.restrictTo('ADMIN', 'KASIR'),
  // validateCreateSupplier,
  supplierController.createSupplier
);

// Endpoint lain untuk supplier jika diperlukan (GET by ID, PUT, DELETE)
// GET /api/suppliers/{idSupplier}
// router.get('/:idSupplier', supplierController.getSupplierById);

// PUT /api/suppliers/{idSupplier}
router.put('/:idSupplier', authMiddleware.restrictTo('ADMIN', 'KASIR'), supplierController.updateSupplier);

// DELETE /api/suppliers/{idSupplier}
router.delete('/:idSupplier', authMiddleware.restrictTo('ADMIN', 'KASIR'), supplierController.deleteSupplier);

module.exports = router;