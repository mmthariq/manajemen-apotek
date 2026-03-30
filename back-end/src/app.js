const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const mainRouter = require('./routes'); // Akan dibuat nanti
const errorHandlerMiddleware = require('./middlewares/errorHandlerMiddleware'); // Akan dibuat nanti

const app = express();

// Middleware Keamanan Dasar
app.use(helmet());

// Middleware untuk parsing JSON body
app.use(express.json());

// Middleware untuk parsing URL-encoded body
app.use(express.urlencoded({ extended: true }));

// Middleware untuk Cross-Origin Resource Sharing (CORS)
// Konfigurasi CORS bisa disesuaikan lebih lanjut sesuai kebutuhan
app.use(cors());
// Contoh konfigurasi CORS yang lebih spesifik:
// const corsOptions = {
//   origin: process.env.CORS_ORIGIN || 'http://localhost:3001', // Ganti dengan origin frontend Anda
//   optionsSuccessStatus: 200 // Beberapa browser lama (IE11, berbagai SmartTVs) bermasalah dengan 204
// };
// app.use(cors(corsOptions));

// Endpoint dasar agar request ke root tidak berakhir 404
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Apotek Pemuda Backend API is running',
    docs: '/api/status',
  });
});

// Endpoint informasi singkat untuk prefix API
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API base path. Gunakan endpoint spesifik seperti /api/status atau /api/auth/login.',
  });
});

// Rute Utama Aplikasi
app.use('/api', mainRouter);

// Static file serving untuk bukti pembayaran
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Middleware untuk menangani rute tidak ditemukan (404)
app.use((req, res, next) => {
  const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
  error.status = 404;
  next(error);
});

// Middleware Penanganan Error Terpusat
// Ini harus menjadi middleware terakhir yang di-mount
app.use(errorHandlerMiddleware);

module.exports = app;