const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rute untuk registrasi pelanggan baru
router.post('/register', customerController.registerCustomer);

router.use(authMiddleware.protect);

// Rute untuk mendapatkan profil pelanggan
router.get('/:customerId/profile', customerController.getCustomerProfile);

// Rute untuk memperbarui profil pelanggan
router.put('/:customerId/profile', customerController.updateCustomerProfile);

// Rute untuk mendapatkan daftar semua pelanggan
router.get('/', authMiddleware.restrictTo('ADMIN', 'KASIR'), customerController.getAllCustomers);

module.exports = router;
