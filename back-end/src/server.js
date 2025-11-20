require('dotenv').config(); // Memuat variabel environment dari .env
const app = require('./app');
const pool = require('./config/database'); // Impor pool koneksi database

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Uji koneksi database
    const client = await pool.connect();
    console.log('Successfully connected to the PostgreSQL database.');
    client.release(); // Lepaskan client kembali ke pool

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Access it at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server or connect to the database:', error);
    process.exit(1); // Keluar dari proses jika ada error kritis
  }
};

startServer();