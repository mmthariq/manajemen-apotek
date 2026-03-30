const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Rute untuk registrasi pelanggan baru
router.post('/register', customerController.registerCustomer);

// Rute untuk mendapatkan profil pelanggan
router.get('/:customerId/profile', customerController.getCustomerProfile);

// Rute untuk memperbarui profil pelanggan
router.put('/:customerId/profile', customerController.updateCustomerProfile);

// Rute untuk mendapatkan daftar semua pelanggan
router.get('/', customerController.getAllCustomers);

module.exports = router;
