# Apotek Pemuda Farma - Backend API

Backend API untuk aplikasi manajemen Apotek Pemuda Farma. Dibangun menggunakan Node.js, Express.js, dan PostgreSQL.

## Fitur Utama

-   Manajemen Autentikasi (Login, Register, Refresh Token)
-   Manajemen Pengguna (CRUD)
-   Manajemen Obat (CRUD)
-   Manajemen Supplier (CRUD)
-   Ringkasan Data Dashboard

## Prasyarat

-   [Node.js](https://nodejs.org/) (versi LTS terbaru direkomendasikan)
-   [PostgreSQL](https://www.postgresql.org/)
-   [npm](https://www.npmjs.com/) atau [Yarn](https://yarnpkg.com/)

## Instalasi

1.  **Clone repository (jika sudah ada di Git):**
    ```bash
    git clone <url_repository>
    cd apotek-pemuda-farma-api
    ```

2.  **Install dependensi:**
    ```bash
    npm install
    ```
    atau jika menggunakan Yarn:
    ```bash
    yarn install
    ```

3.  **Setup variabel environment:**
    Salin file `.env.example` menjadi `.env`:
    ```bash
    cp .env.example .env
    ```
    Kemudian, sesuaikan nilai variabel di dalam file `.env` sesuai dengan konfigurasi lokal Anda (terutama untuk koneksi database dan JWT secret).

    Contoh isi `.env`:
    ```env
    # Application Configuration
    PORT=3000
    NODE_ENV=development

    # JWT Configuration
    JWT_SECRET=your_strong_jwt_secret_key_here
    JWT_EXPIRES_IN=1h
    JWT_REFRESH_SECRET=your_strong_jwt_refresh_secret_key_here
    JWT_REFRESH_EXPIRES_IN=7d

    # Database Configuration (PostgreSQL)
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=postgres_user
    DB_PASSWORD=postgres_password
    DB_NAME=apotek_pemuda_farma_db
    ```

4.  **Pastikan database PostgreSQL sudah berjalan dan database `apotek_pemuda_farma_db` (atau nama yang Anda tentukan di `.env`) sudah dibuat.**

## Menjalankan Aplikasi

-   **Mode Pengembangan (dengan auto-reload menggunakan Nodemon):**
    ```bash
    npm run dev
    ```

-   **Mode Produksi:**
    ```bash
    npm start
    ```

Aplikasi akan berjalan di `http://localhost:PORT` (default `http://localhost:3000`).

## Struktur Proyek

```
apotek-pemuda-farma-api/
├── src/
│   ├── config/               # Konfigurasi (variabel environment, koneksi DB)
│   ├── controllers/          # Logika penanganan request dan response HTTP
│   ├── middlewares/          # Middleware kustom
│   ├── models/               # Model data (interaksi database)
│   ├── routes/               # Definisi rute API
│   ├── services/             # Lapisan logika bisnis
│   ├── utils/                # Fungsi utilitas
│   ├── app.js                # Titik masuk utama aplikasi Express
│   └── server.js             # Inisialisasi server HTTP
├── tests/                    # File tes
├── .env                      # Variabel environment (lokal, jangan di-commit)
├── .env.example              # Contoh variabel environment
├── .gitignore                # File yang diabaikan Git
├── package.json              # Informasi proyek dan dependensi
└── README.md                 # Dokumentasi ini
```

## Endpoint API

Lihat dokumentasi API (misalnya, menggunakan Swagger/OpenAPI jika diimplementasikan) untuk detail lengkap mengenai endpoint yang tersedia.

Secara umum, endpoint akan mengikuti pola berikut:

-   **Auth:** `/api/auth/...`
-   **Users:** `/api/users/...`
-   **Drugs:** `/api/obat/...`
-   **Suppliers:** `/api/suppliers/...`
-   **Dashboard:** `/api/dashboard/...`

## Kontribusi

Silakan buat *issue* atau *pull request* jika Anda ingin berkontribusi.

## Lisensi

[ISC](LICENSE) (jika ada file LICENSE, jika tidak, bisa dihilangkan atau diganti)