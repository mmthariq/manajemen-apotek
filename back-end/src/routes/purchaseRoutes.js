const express = require('express');
const purchaseController = require('../controllers/purchaseController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('ADMIN', 'KASIR'));

router.get('/', purchaseController.getPurchases);
router.post('/', purchaseController.createPurchase);
router.get('/:id', purchaseController.getPurchaseById);

module.exports = router;
