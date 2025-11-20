const express = require('express');
const authRoutes = require('./authRoutes'); // Akan dibuat
const userRoutes = require('./userRoutes'); // Akan dibuat
const drugRoutes = require('./drugRoutes'); // Akan dibuat
const supplierRoutes = require('./supplierRoutes'); // Akan dibuat
const dashboardRoutes = require('./dashboardRoutes'); // Akan dibuat

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

module.exports = router;