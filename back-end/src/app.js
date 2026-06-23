const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const favicon = require('serve-favicon'); // Pindahkan ke atas bersama import lain
const mainRouter = require('./routes');
const errorHandlerMiddleware = require('./middlewares/errorHandlerMiddleware');

const app = express(); // 1. Inisialisasi APP dulu!

// 2. Middleware Favicon (Taruh di paling atas setelah inisialisasi app)
// Pastikan file ini ada di: D:\Apotek Pemuda\back-end\public\favicon.ico
try {
    app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
} catch (e) {
    console.log("Favicon file not found, skipping...");
}

// 3. Middleware Keamanan & Parser
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration - apply globally including static files
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || '*'  // Use FRONTEND_URL from .env in production
    : '*',  // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// 4. Routes
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Apotek Pemuda Backend API is running',
        docs: '/api/status',
    });
});

app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API base path. Gunakan endpoint spesifik seperti /api/status.',
    });
});

app.use('/api', mainRouter);

// ── Static file serving with CORS and cache control ──
app.use('/uploads', (req, res, next) => {
  // Explicit CORS headers for static files
  res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL || '*' : '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Cache control: cache for 7 days
  res.header('Cache-Control', 'public, max-age=604800');
  
  next();
}, express.static(path.join(__dirname, '..', 'uploads')));

// 5. Error Handling (Harus di paling bawah)
app.use((req, res, next) => {
    const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
    error.status = 404;
    next(error);
});

app.use(errorHandlerMiddleware);

module.exports = app;