# Test Case - Sistem Manajemen Apotek Pemuda
## Bagian 1: Autentikasi, Pengguna, & Obat

---

## MODUL 1: AUTENTIKASI (AUTH)

### TC-AUTH-001: Login Admin Berhasil
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat login dengan kredensial valid |
| **Pre-condition** | Akun admin sudah terdaftar di database |
| **Langkah** | 1. Buka halaman `/login` 2. Pilih role "Admin" 3. Masukkan username & password valid 4. Klik tombol Login |
| **Data Uji** | `{ email: "admin", password: "admin123", role: "admin" }` |
| **Expected Result** | Status 200, token JWT diterima, redirect ke `/dashboard` |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-002: Login Kasir Berhasil
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi kasir dapat login dengan kredensial valid |
| **Pre-condition** | Akun kasir sudah terdaftar di database |
| **Langkah** | 1. Buka `/login` 2. Pilih role "Kasir" 3. Masukkan username & password valid 4. Klik Login |
| **Data Uji** | `{ email: "kasir1", password: "kasir123", role: "kasir" }` |
| **Expected Result** | Status 200, token JWT diterima, redirect ke `/dashboard-kasir` |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-003: Login Customer Berhasil
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi customer dapat login via halaman customer login |
| **Pre-condition** | Akun customer sudah terdaftar |
| **Langkah** | 1. Buka `/customer-login` 2. Masukkan email & password valid 3. Klik Login |
| **Data Uji** | `{ email: "customer@test.com", password: "cust123", role: "customer" }` |
| **Expected Result** | Status 200, redirect ke `/customer-dashboard` |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-004: Login Owner Berhasil
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi owner dapat login |
| **Pre-condition** | Akun owner sudah terdaftar |
| **Langkah** | 1. Buka `/login` 2. Pilih role "Owner" 3. Masukkan username & password valid 4. Klik Login |
| **Data Uji** | `{ email: "owner", password: "owner123", role: "owner" }` |
| **Expected Result** | Status 200, redirect ke `/laporan` |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-005: Login Gagal - Kredensial Salah
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi sistem menolak login dengan password salah |
| **Pre-condition** | Akun admin terdaftar |
| **Langkah** | 1. Buka `/login` 2. Masukkan username valid, password salah 3. Klik Login |
| **Data Uji** | `{ email: "admin", password: "wrongpass", role: "admin" }` |
| **Expected Result** | Status 401, pesan "Kredensial tidak valid." |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-006: Login Gagal - Field Kosong
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi field kosong saat login |
| **Pre-condition** | - |
| **Langkah** | 1. Buka `/login` 2. Klik Login tanpa mengisi field |
| **Data Uji** | `{ email: "", password: "", role: "" }` |
| **Expected Result** | Status 400, pesan "Email, password, dan role harus diisi." |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-007: Login Gagal - Role Tidak Valid
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi sistem menolak role yang tidak valid |
| **Pre-condition** | - |
| **Langkah** | 1. Kirim request login dengan role tidak valid |
| **Data Uji** | `{ email: "admin", password: "admin123", role: "superadmin" }` |
| **Expected Result** | Status 400, pesan "Role tidak valid." |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-008: Logout Berhasil
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi user dapat logout |
| **Pre-condition** | User sudah login |
| **Langkah** | 1. Klik tombol Logout |
| **Expected Result** | Status 200, token dihapus, redirect ke halaman login |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-009: Akses Endpoint Tanpa Token
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi endpoint protected menolak request tanpa token |
| **Pre-condition** | - |
| **Langkah** | 1. Akses `GET /api/obat` tanpa header Authorization |
| **Expected Result** | Status 401, pesan "Token autentikasi tidak ditemukan." |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-010: Akses Endpoint Dengan Token Expired
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi sistem menolak token kadaluarsa |
| **Pre-condition** | Token JWT sudah expired |
| **Langkah** | 1. Akses endpoint protected dengan token expired |
| **Expected Result** | Status 401, pesan "Token tidak valid atau sudah kedaluwarsa." |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-011: Cek Sesi (GET /api/auth/me)
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi endpoint me mengembalikan data user yang sedang login |
| **Pre-condition** | User sudah login |
| **Langkah** | 1. Kirim `GET /api/auth/me` dengan token valid |
| **Expected Result** | Status 200, data user (id, username, email, role) |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-012: Forgot Password - Kirim OTP
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi sistem mengirim OTP reset password |
| **Pre-condition** | Customer terdaftar dengan email valid |
| **Langkah** | 1. Buka `/lupa-password` 2. Masukkan email terdaftar 3. Klik Kirim |
| **Data Uji** | `{ email: "customer@test.com" }` |
| **Expected Result** | Status 200, pesan "Jika email terdaftar, kode verifikasi telah dikirim." |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-013: Forgot Password - Email Tidak Terdaftar
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi sistem tetap menampilkan pesan sukses (mencegah enumerasi) |
| **Pre-condition** | - |
| **Langkah** | 1. Masukkan email yang tidak terdaftar |
| **Data Uji** | `{ email: "notexist@test.com" }` |
| **Expected Result** | Status 200, pesan yang sama (tidak mengungkap email terdaftar/tidak) |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-014: Verifikasi OTP Reset Password
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi OTP reset password berhasil divalidasi |
| **Pre-condition** | OTP sudah dikirim |
| **Langkah** | 1. Masukkan email dan kode OTP yang benar |
| **Expected Result** | Status 200, pesan "Kode verifikasi valid." |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-015: Verifikasi OTP - Kode Salah
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi sistem menolak OTP yang salah |
| **Pre-condition** | OTP sudah dikirim |
| **Langkah** | 1. Masukkan kode OTP yang salah |
| **Expected Result** | Status 400, pesan "Kode verifikasi salah." |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-016: Reset Password Berhasil
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi password berhasil direset |
| **Pre-condition** | OTP sudah diverifikasi |
| **Langkah** | 1. Masukkan password baru dan konfirmasi |
| **Data Uji** | `{ newPassword: "newpass123", confirmPassword: "newpass123" }` |
| **Expected Result** | Status 200, pesan "Password berhasil direset!" |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-017: Reset Password - Konfirmasi Tidak Cocok
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi konfirmasi password |
| **Pre-condition** | OTP sudah diverifikasi |
| **Langkah** | 1. Masukkan password baru dan konfirmasi berbeda |
| **Expected Result** | Status 400, pesan "Konfirmasi password tidak cocok." |
| **Actual Result** | |
| **Status** | |

### TC-AUTH-018: Reset Password - Kurang dari 6 Karakter
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi panjang password minimum |
| **Pre-condition** | OTP sudah diverifikasi |
| **Data Uji** | `{ newPassword: "abc", confirmPassword: "abc" }` |
| **Expected Result** | Status 400, pesan "Password baru minimal 6 karakter." |
| **Actual Result** | |
| **Status** | |

---

## MODUL 2: REGISTRASI CUSTOMER

### TC-REG-001: Registrasi Customer Berhasil
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi customer baru dapat mendaftar |
| **Pre-condition** | Email belum terdaftar |
| **Langkah** | 1. Buka `/register-customer` 2. Isi form lengkap 3. Klik Daftar |
| **Data Uji** | `{ name: "Test User", email: "test@mail.com", password: "test123" }` |
| **Expected Result** | Status 201, akun berhasil dibuat |
| **Actual Result** | |
| **Status** | |

### TC-REG-002: Registrasi - Email Sudah Terdaftar
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi sistem menolak email duplikat |
| **Pre-condition** | Email sudah terdaftar |
| **Langkah** | 1. Daftar dengan email yang sudah ada |
| **Expected Result** | Status 409, pesan "Email sudah terdaftar." |
| **Actual Result** | |
| **Status** | |

### TC-REG-003: Registrasi - Field Wajib Kosong
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi field wajib |
| **Pre-condition** | - |
| **Langkah** | 1. Submit form tanpa mengisi nama/email/password |
| **Expected Result** | Status 400, pesan validasi error |
| **Actual Result** | |
| **Status** | |

---

## MODUL 3: MANAJEMEN PENGGUNA (ADMIN)

### TC-USR-001: Lihat Semua Pengguna
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat melihat daftar semua pengguna |
| **Pre-condition** | Login sebagai admin |
| **Langkah** | 1. Buka halaman `/manajemen-pengguna` |
| **Expected Result** | Status 200, daftar pengguna ditampilkan |
| **Actual Result** | |
| **Status** | |

### TC-USR-002: Tambah Pengguna Baru
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat menambah pengguna baru |
| **Pre-condition** | Login sebagai admin |
| **Langkah** | 1. Klik Tambah Pengguna 2. Isi form 3. Submit |
| **Data Uji** | `{ username: "kasir2", password: "pass123", role: "kasir" }` |
| **Expected Result** | Status 201, pengguna baru muncul di daftar |
| **Actual Result** | |
| **Status** | |

### TC-USR-003: Tambah Pengguna - Username Duplikat
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi sistem menolak username duplikat |
| **Pre-condition** | Username sudah ada |
| **Expected Result** | Status 409, pesan "Username atau email sudah digunakan." |
| **Actual Result** | |
| **Status** | |

### TC-USR-004: Edit Pengguna
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat mengedit data pengguna |
| **Pre-condition** | Login sebagai admin, pengguna target ada |
| **Langkah** | 1. Klik Edit pada pengguna 2. Ubah data 3. Simpan |
| **Expected Result** | Status 200, data berhasil diperbarui |
| **Actual Result** | |
| **Status** | |

### TC-USR-005: Hapus Pengguna
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat menghapus pengguna |
| **Pre-condition** | Login sebagai admin |
| **Langkah** | 1. Klik Hapus pada pengguna 2. Konfirmasi |
| **Expected Result** | Status 200, pengguna dihapus dari daftar |
| **Actual Result** | |
| **Status** | |

### TC-USR-006: Akses Manajemen Pengguna Oleh Non-Admin
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi kasir tidak dapat mengakses halaman pengguna |
| **Pre-condition** | Login sebagai kasir |
| **Langkah** | 1. Akses `/manajemen-pengguna` |
| **Expected Result** | Redirect ke dashboard kasir (403) |
| **Actual Result** | |
| **Status** | |

---

## MODUL 4: MANAJEMEN OBAT (STOK)

### TC-DRG-001: Lihat Semua Obat
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat melihat daftar obat |
| **Pre-condition** | Login sebagai admin |
| **Langkah** | 1. Buka `/manajemen-stok` |
| **Expected Result** | Status 200, daftar obat dengan nama, stok, harga, supplier |
| **Actual Result** | |
| **Status** | |

### TC-DRG-002: Tambah Obat Baru
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat menambah obat baru |
| **Pre-condition** | Login sebagai admin |
| **Langkah** | 1. Klik Tambah Obat 2. Isi form 3. Submit |
| **Data Uji** | `{ name: "Paracetamol", stock: 100, unit: "tablet", price: 5000 }` |
| **Expected Result** | Status 201, obat muncul di daftar |
| **Actual Result** | |
| **Status** | |

### TC-DRG-003: Tambah Obat - Validasi Field Wajib
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi saat nama/stok/unit/harga kosong |
| **Pre-condition** | Login sebagai admin |
| **Langkah** | 1. Submit form obat tanpa nama |
| **Expected Result** | Status 400, pesan validasi |
| **Actual Result** | |
| **Status** | |

### TC-DRG-004: Tambah Obat Dengan Supplier
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi obat dapat ditambah dengan relasi supplier |
| **Pre-condition** | Supplier sudah ada di database |
| **Data Uji** | `{ name: "Amoxicillin", stock: 50, unit: "kapsul", price: 8000, supplierId: 1 }` |
| **Expected Result** | Status 201, obat muncul dengan nama supplier |
| **Actual Result** | |
| **Status** | |

### TC-DRG-005: Tambah Obat - Supplier Tidak Ditemukan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi supplierId yang tidak ada |
| **Data Uji** | `{ supplierId: 99999 }` |
| **Expected Result** | Status 400, pesan "Supplier dengan ID 99999 tidak ditemukan." |
| **Actual Result** | |
| **Status** | |

### TC-DRG-006: Edit Obat
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat mengedit data obat |
| **Langkah** | 1. Klik Edit 2. Ubah harga 3. Simpan |
| **Expected Result** | Status 200, data diperbarui |
| **Actual Result** | |
| **Status** | |

### TC-DRG-007: Hapus Obat
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat menghapus obat |
| **Langkah** | 1. Klik Hapus 2. Konfirmasi |
| **Expected Result** | Status 200, obat dihapus dari daftar |
| **Actual Result** | |
| **Status** | |

### TC-DRG-008: Lihat Detail Obat
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi detail obat dapat dilihat berdasarkan ID |
| **Langkah** | 1. Akses `GET /api/obat/:id` |
| **Expected Result** | Status 200, data lengkap obat |
| **Actual Result** | |
| **Status** | |

### TC-DRG-009: Detail Obat Tidak Ditemukan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi respons untuk ID obat tidak valid |
| **Langkah** | 1. Akses `GET /api/obat/99999` |
| **Expected Result** | Status 404 |
| **Actual Result** | |
| **Status** | |
