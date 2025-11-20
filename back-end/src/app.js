const express = require('express');
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

// Rute Utama Aplikasi
app.use('/api', mainRouter);

// Middleware untuk menangani rute tidak ditemukan (404)
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Middleware Penanganan Error Terpusat
// Ini harus menjadi middleware terakhir yang di-mount
app.use(errorHandlerMiddleware);

module.exports = app;