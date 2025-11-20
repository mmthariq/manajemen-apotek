const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  // Opsi tambahan untuk pool koneksi jika diperlukan:
  // max: 20, // jumlah maksimum client dalam pool
  // idleTimeoutMillis: 30000, // berapa lama client bisa idle sebelum ditutup
  // connectionTimeoutMillis: 2000, // berapa lama menunggu koneksi sebelum timeout
});

// Event listener untuk error pada pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Keluar dari aplikasi jika ada error pada pool
});

// Fungsi untuk menguji koneksi (opsional, sudah ada di server.js)
// async function testConnection() {
//   try {
//     const client = await pool.connect();
//     console.log('Successfully connected to the PostgreSQL database via pool.');
//     client.release();
//   } catch (error) {
//     console.error('Failed to connect to the PostgreSQL database:', error);
//     throw error; // Melempar error agar bisa ditangani oleh pemanggil
//   }
// }

// testConnection(); // Panggil jika ingin menguji koneksi saat modul ini di-load

module.exports = pool;