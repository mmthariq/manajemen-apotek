const config = require('../config/config');

// eslint-disable-next-line no-unused-vars
const errorHandlerMiddleware = (err, req, res, next) => {
  console.error(err); // Log error ke console untuk debugging

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    // Hanya tampilkan stack trace di mode development
    stack: config.env === 'development' ? err.stack : undefined,
    // Bisa ditambahkan detail error lain jika ada, misalnya dari validasi
    errors: err.errors || undefined,
  });
};

module.exports = errorHandlerMiddleware;