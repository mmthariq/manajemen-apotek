const express = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/analytics/export', authMiddleware.restrictTo('ADMIN', 'OWNER'), reportController.exportAnalytics);
router.get('/sales-kasir/export', authMiddleware.restrictTo('ADMIN', 'KASIR', 'OWNER'), reportController.exportKasirSales);

module.exports = router;
