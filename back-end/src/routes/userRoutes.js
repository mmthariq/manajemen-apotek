const express = require('express');
const userController = require('../controllers/userController'); // Akan dibuat
// const authMiddleware = require('../middlewares/authMiddleware'); // Akan dibuat (untuk proteksi rute)
// const { validateCreateUser, validateUpdateUser } = require('../middlewares/validationMiddleware'); // Akan dibuat

const router = express.Router();

// Middleware untuk semua rute di bawah ini (jika semua butuh autentikasi dan role tertentu)
// router.use(authMiddleware.protect); // Contoh proteksi umum
// router.use(authMiddleware.restrictTo('admin')); // Contoh pembatasan role admin

// GET /api/users - Mendapatkan daftar semua pengguna
router.get(
  '/',
  // authMiddleware.restrictTo('admin'), // Hanya admin
  userController.getAllUsers
);

// POST /api/users - Menambahkan pengguna baru
router.post(
  '/',
  // authMiddleware.restrictTo('admin'), // Hanya admin
  // validateCreateUser,
  userController.createUser
);

// GET /api/users/{idUser} - Mendapatkan detail satu pengguna berdasarkan ID
router.get(
  '/:idUser',
  // authMiddleware.protect, // Pengguna terautentikasi atau admin
  userController.getUserById
);

// PUT /api/users/{idUser} - Memperbarui data pengguna berdasarkan ID
router.put(
  '/:idUser',
  // authMiddleware.protect, // Pengguna terautentikasi yang bersangkutan atau admin
  // validateUpdateUser,
  userController.updateUser
);

// DELETE /api/users/{idUser} - Menghapus pengguna berdasarkan ID
router.delete(
  '/:idUser',
  // authMiddleware.restrictTo('admin'), // Hanya admin
  userController.deleteUser
);

module.exports = router;