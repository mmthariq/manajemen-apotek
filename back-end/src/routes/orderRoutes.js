const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const orderController = require('../controllers/orderController');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'payment-proofs');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const safeExtension = ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(extension) ? extension : '';
    const filename = `payment-${req.params.id}-${Date.now()}${safeExtension}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }

  cb(new Error('Format bukti pembayaran harus berupa gambar.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/pay', upload.single('paymentProof'), orderController.payOrder);
router.patch('/:id/cancel', orderController.cancelOrder);

module.exports = router;
