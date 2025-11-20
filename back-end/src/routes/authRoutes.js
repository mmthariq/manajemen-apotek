const express = require('express');
const authController = require('../controllers/authController'); // Akan dibuat
// const { validateLogin, validateForgotPassword, validateResetPassword } = require('../middlewares/validationMiddleware'); // Akan dibuat

const router = express.Router();

// POST /api/auth/login
router.post(
  '/login',
  // validateLogin, // Middleware validasi (opsional, akan ditambahkan nanti)
  authController.login
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  // validateForgotPassword, // Middleware validasi
  authController.forgotPassword
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  // validateResetPassword, // Middleware validasi
  authController.resetPassword
);

// Endpoint untuk register (jika diperlukan, tidak ada di gambar awal tapi umum)
// router.post(
//   '/register',
//   // validateRegister,
//   authController.register
// );

// Endpoint untuk logout (jika menggunakan blacklist token)
router.post('/logout', authController.logout);

// Endpoint untuk refresh token (jika diperlukan, tidak ada di gambar awal tapi umum)
// router.post('/refresh-token', authController.refreshToken);

module.exports = router;