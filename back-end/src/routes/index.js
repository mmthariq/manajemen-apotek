const express = require('express');
const authRoutes = require('./authRoutes'); // Akan dibuat
const userRoutes = require('./userRoutes'); // Akan dibuat
const drugRoutes = require('./drugRoutes'); // Akan dibuat
const supplierRoutes = require('./supplierRoutes'); // Akan dibuat
const dashboardRoutes = require('./dashboardRoutes'); // Akan dibuat
const customerRoutes = require('./customerRoutes'); // Fitur customer membership
const customMedicineRoutes = require('./customMedicineRoutes'); // Fitur obat racikan
const orderRoutes = require('./orderRoutes'); // Fitur pesanan online
const purchaseRoutes = require('./purchaseRoutes');
const reportRoutes = require('./reportRoutes');

const router = express.Router();

// Rute untuk health check atau status API
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is up and running',
    timestamp: new Date().toISOString(),
  });
});

// Menggabungkan rute-rute modul
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/obat', drugRoutes); // Sesuai dengan gambar: /api/obat
router.use('/suppliers', supplierRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/customers', customerRoutes); // Fitur customer membership & online shopping
router.use('/custom-medicine', customMedicineRoutes); // Fitur obat racikan
router.use('/orders', orderRoutes); // Fitur pesanan online
router.use('/purchases', purchaseRoutes); // Fitur pengadaan
router.use('/reports', reportRoutes); // Export laporan

module.exports = router;