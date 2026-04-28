const express = require('express');
const dashboardController = require('../controllers/dashboardController'); // Akan dibuat
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('ADMIN', 'KASIR', 'OWNER'));

// GET /api/dashboard/summary - Mendapatkan rangkuman statistik utama
router.get(
  '/summary',
  dashboardController.getDashboardSummary
);

router.get(
  '/analytics',
  dashboardController.getDashboardAnalytics
);

router.get(
  '/notifications',
  dashboardController.getDashboardNotifications
);

module.exports = router;