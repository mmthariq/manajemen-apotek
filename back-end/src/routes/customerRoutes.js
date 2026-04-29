const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const verificationController = require('../controllers/verificationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rute untuk registrasi pelanggan baru
router.post('/register', customerController.registerCustomer);

router.use(authMiddleware.protect);

// Rute untuk mendapatkan profil pelanggan
router.get('/:customerId/profile', customerController.getCustomerProfile);

// Rute untuk memperbarui profil pelanggan
router.put('/:customerId/profile', customerController.updateCustomerProfile);

// ─── Verification-based changes (email & password) ──────────────
router.post('/security/request-email-otp', verificationController.requestEmailChangeOtp);
router.post('/security/verify-email', verificationController.verifyAndChangeEmail);
router.post('/security/request-password-otp', verificationController.requestPasswordChangeOtp);
router.post('/security/verify-password', verificationController.verifyAndChangePassword);

// Rute untuk mendapatkan daftar semua pelanggan
router.get('/', authMiddleware.restrictTo('ADMIN', 'KASIR'), customerController.getAllCustomers);

module.exports = router;

