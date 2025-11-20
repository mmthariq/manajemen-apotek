const express = require('express');
const supplierController = require('../controllers/supplierController'); // Akan dibuat
// const authMiddleware = require('../middlewares/authMiddleware'); // Akan dibuat
// const { validateCreateSupplier } = require('../middlewares/validationMiddleware'); // Akan dibuat

const router = express.Router();

// Middleware untuk proteksi dan role (misalnya, hanya admin)
// router.use(authMiddleware.protect);
// router.use(authMiddleware.restrictTo('admin'));

// GET /api/suppliers - Mendapatkan daftar seluruh supplier
router.get(
  '/',
  supplierController.getAllSuppliers
);

// POST /api/suppliers - Menambahkan supplier baru
router.post(
  '/',
  // validateCreateSupplier,
  supplierController.createSupplier
);

// Endpoint lain untuk supplier jika diperlukan (GET by ID, PUT, DELETE)
// GET /api/suppliers/{idSupplier}
// router.get('/:idSupplier', supplierController.getSupplierById);

// PUT /api/suppliers/{idSupplier}
// router.put('/:idSupplier', validateUpdateSupplier, supplierController.updateSupplier);

// DELETE /api/suppliers/{idSupplier}
// router.delete('/:idSupplier', supplierController.deleteSupplier);

module.exports = router;