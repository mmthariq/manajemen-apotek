const express = require('express');
const dashboardController = require('../controllers/dashboardController'); // Akan dibuat
// const authMiddleware = require('../middlewares/authMiddleware'); // Akan dibuat

const router = express.Router();

// Middleware untuk proteksi dan role (misalnya, hanya admin atau apoteker)
// router.use(authMiddleware.protect);
// router.use(authMiddleware.restrictTo('admin', 'apoteker'));

// GET /api/dashboard/summary - Mendapatkan rangkuman statistik utama
router.get(
  '/summary',
  dashboardController.getDashboardSummary
);

module.exports = router;