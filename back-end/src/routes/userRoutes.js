const express = require('express');
const userController = require('../controllers/userController'); // Akan dibuat
const authMiddleware = require('../middlewares/authMiddleware');
// const { validateCreateUser, validateUpdateUser } = require('../middlewares/validationMiddleware'); // Akan dibuat

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('ADMIN'));

// GET /api/users - Mendapatkan daftar semua pengguna
router.get(
  '/',
  userController.getAllUsers
);

// POST /api/users - Menambahkan pengguna baru
router.post(
  '/',
  // validateCreateUser,
  userController.createUser
);

// GET /api/users/{idUser} - Mendapatkan detail satu pengguna berdasarkan ID
router.get(
  '/:idUser',
  userController.getUserById
);

// PUT /api/users/{idUser} - Memperbarui data pengguna berdasarkan ID
router.put(
  '/:idUser',
  // validateUpdateUser,
  userController.updateUser
);

// DELETE /api/users/{idUser} - Menghapus pengguna berdasarkan ID
router.delete(
  '/:idUser',
  userController.deleteUser
);

module.exports = router;