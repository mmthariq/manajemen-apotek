require('dotenv').config(); // Pastikan variabel environment dimuat

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  cors: {
    origin: process.env.CORS_ORIGIN, // Bisa diisi dengan URL frontend Anda
  },
  // Tambahkan konfigurasi lain jika diperlukan
  // Misalnya, untuk layanan email, logging, dll.
};

// Validasi variabel environment yang penting
if (!config.jwt.secret || !config.jwt.refreshSecret) {
  console.error('FATAL ERROR: JWT_SECRET and JWT_REFRESH_SECRET must be defined in .env file.');
  process.exit(1);
}

if (!config.db.host || !config.db.user || !config.db.password || !config.db.name) {
  console.error('FATAL ERROR: Database configuration (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) must be defined in .env file.');
  process.exit(1);
}

module.exports = config;