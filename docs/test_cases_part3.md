# Test Case - Sistem Manajemen Apotek Pemuda
## Bagian 3: Transaksi, Pesanan Online, Dashboard, Laporan, & Profil

---

## MODUL 8: TRANSAKSI PENJUALAN (OFFLINE - KASIR)

### TC-TRX-001: Buat Transaksi Offline (Obat Reguler)
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi kasir dapat membuat transaksi penjualan offline |
| **Pre-condition** | Login sebagai kasir, obat tersedia dengan stok cukup |
| **Langkah** | 1. Buka `/transaksi-kasir` 2. Tambah item obat 3. Klik Selesai |
| **Data Uji** | `{ items: [{ productId: 1, productType: "regular", quantity: 3 }] }` |
| **Expected Result** | Status 201, transaksi OFFLINE/COMPLETED, stok berkurang 3 |
| **Actual Result** | |
| **Status** | |

### TC-TRX-002: Transaksi Offline - Multi Item
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi transaksi dengan beberapa obat sekaligus |
| **Data Uji** | `{ items: [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 1 }] }` |
| **Expected Result** | Total harga = sum(unitPrice × quantity), semua stok berkurang |
| **Actual Result** | |
| **Status** | |

### TC-TRX-003: Transaksi Offline - Obat Racikan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi transaksi offline dengan obat racikan |
| **Data Uji** | `{ items: [{ productId: 1, productType: "custom", quantity: 1 }] }` |
| **Expected Result** | Stok racikan berkurang, stok bahan baku juga berkurang |
| **Actual Result** | |
| **Status** | |

### TC-TRX-004: Transaksi - Stok Tidak Mencukupi
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi transaksi gagal jika stok tidak cukup |
| **Pre-condition** | Stok obat = 5 |
| **Data Uji** | `{ items: [{ productId: 1, quantity: 10 }] }` |
| **Expected Result** | Status 400, pesan stok tidak mencukupi, transaksi rollback |
| **Actual Result** | |
| **Status** | |

### TC-TRX-005: Transaksi - Item Kosong
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi item wajib ada |
| **Data Uji** | `{ items: [] }` |
| **Expected Result** | Status 400, pesan "Item pesanan tidak boleh kosong." |
| **Actual Result** | |
| **Status** | |

### TC-TRX-006: Transaksi - Obat Tidak Ditemukan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi jika obat tidak ada |
| **Data Uji** | `{ items: [{ productId: 99999, quantity: 1 }] }` |
| **Expected Result** | Status 400, pesan obat tidak ditemukan |
| **Actual Result** | |
| **Status** | |

### TC-TRX-007: Lihat Riwayat Transaksi (Admin)
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat melihat semua transaksi |
| **Pre-condition** | Login sebagai admin |
| **Langkah** | 1. Buka halaman `/transaksi` |
| **Expected Result** | Daftar transaksi ditampilkan |
| **Actual Result** | |
| **Status** | |

---

## MODUL 9: PESANAN ONLINE (CUSTOMER)

### TC-ORD-001: Buat Pesanan Online
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi customer dapat membuat pesanan online |
| **Pre-condition** | Login sebagai customer |
| **Langkah** | 1. Buka katalog 2. Tambah obat ke keranjang 3. Checkout |
| **Data Uji** | `{ items: [{ productId: 1, productType: "regular", quantity: 2 }] }` |
| **Expected Result** | Status 201, pesanan ONLINE/PENDING, stok belum berkurang |
| **Actual Result** | |
| **Status** | |

### TC-ORD-002: Buat Pesanan Dengan Resep
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi customer dapat mengunggah foto resep saat checkout |
| **Pre-condition** | Login sebagai customer |
| **Langkah** | 1. Checkout 2. Unggah gambar resep |
| **Expected Result** | Status 201, prescriptionImageUrl tersimpan |
| **Actual Result** | |
| **Status** | |

### TC-ORD-003: Lihat Daftar Pesanan (Customer)
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi customer hanya melihat pesanannya sendiri |
| **Pre-condition** | Login sebagai customer |
| **Langkah** | 1. Buka tab riwayat pesanan |
| **Expected Result** | Hanya pesanan milik customer yang login |
| **Actual Result** | |
| **Status** | |

### TC-ORD-004: Lihat Daftar Pesanan (Kasir)
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi kasir dapat melihat semua pesanan online |
| **Pre-condition** | Login sebagai kasir |
| **Expected Result** | Semua pesanan online ditampilkan |
| **Actual Result** | |
| **Status** | |

### TC-ORD-005: Lihat Detail Pesanan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi detail pesanan dengan item-item |
| **Langkah** | 1. Klik detail pada pesanan |
| **Expected Result** | Status 200, data pesanan + items lengkap |
| **Actual Result** | |
| **Status** | |

### TC-ORD-006: Customer Akses Pesanan Milik Orang Lain
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi customer tidak bisa melihat pesanan user lain |
| **Langkah** | 1. Akses pesanan ID milik customer lain |
| **Expected Result** | Status 403, pesan "Anda tidak memiliki akses ke pesanan ini." |
| **Actual Result** | |
| **Status** | |

### TC-ORD-007: Upload Bukti Pembayaran
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi customer dapat mengunggah bukti bayar |
| **Pre-condition** | Pesanan status PENDING |
| **Langkah** | 1. Pilih pesanan 2. Upload gambar bukti 3. Submit |
| **Expected Result** | Status 200, paymentProofImageUrl tersimpan |
| **Actual Result** | |
| **Status** | |

### TC-ORD-008: Upload Bukti - Pesanan Bukan PENDING
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi status saat upload bukti |
| **Pre-condition** | Pesanan status VERIFIED |
| **Expected Result** | Status 400, "Status pesanan tidak dapat dibayarkan." |
| **Actual Result** | |
| **Status** | |

### TC-ORD-009: Upload Bukti - Tanpa File
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi file wajib |
| **Langkah** | 1. Submit tanpa file |
| **Expected Result** | Status 400, "Bukti pembayaran wajib diunggah." |
| **Actual Result** | |
| **Status** | |

### TC-ORD-010: Verifikasi Pembayaran (Kasir)
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi kasir dapat memverifikasi bukti pembayaran |
| **Pre-condition** | Login kasir, pesanan PENDING dengan bukti bayar |
| **Langkah** | 1. Klik Verifikasi pada pesanan |
| **Expected Result** | Status 200, status berubah VERIFIED |
| **Actual Result** | |
| **Status** | |

### TC-ORD-011: Verifikasi - Belum Ada Bukti Bayar
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi bukti bayar harus ada |
| **Pre-condition** | Pesanan PENDING tanpa bukti |
| **Expected Result** | Status 400, "Pesanan belum memiliki bukti pembayaran." |
| **Actual Result** | |
| **Status** | |

### TC-ORD-012: Selesaikan Pesanan (Kasir)
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi kasir dapat menyelesaikan pesanan terverifikasi |
| **Pre-condition** | Pesanan VERIFIED, stok cukup |
| **Langkah** | 1. Isi aturan pakai 2. Klik Selesaikan |
| **Data Uji** | `{ orderStatus: "COMPLETED", usageInstructions: "3x1 sehari" }` |
| **Expected Result** | Status 200, status COMPLETED, stok berkurang |
| **Actual Result** | |
| **Status** | |

### TC-ORD-013: Selesaikan Pesanan - Tanpa Aturan Pakai
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi aturan pakai wajib diisi |
| **Data Uji** | `{ orderStatus: "COMPLETED", usageInstructions: "" }` |
| **Expected Result** | Status 400, "Aturan pakai wajib diisi." |
| **Actual Result** | |
| **Status** | |

### TC-ORD-014: Selesaikan Pesanan - Status Bukan VERIFIED
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi hanya pesanan VERIFIED yang bisa diselesaikan |
| **Pre-condition** | Pesanan PENDING |
| **Expected Result** | Status 400, "Pesanan hanya bisa diselesaikan setelah pembayaran terverifikasi." |
| **Actual Result** | |
| **Status** | |

### TC-ORD-015: Batalkan Pesanan (Customer)
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi customer dapat membatalkan pesanan PENDING |
| **Pre-condition** | Pesanan PENDING |
| **Langkah** | 1. Klik Batalkan |
| **Expected Result** | Status 200, status CANCELLED |
| **Actual Result** | |
| **Status** | |

### TC-ORD-016: Batalkan Pesanan - Status Bukan PENDING
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi pesanan yang sudah diproses tidak bisa dibatalkan |
| **Pre-condition** | Pesanan VERIFIED |
| **Expected Result** | Status 400, "Pesanan tidak dapat dibatalkan karena sudah diproses." |
| **Actual Result** | |
| **Status** | |

### TC-ORD-017: Hapus Pesanan Dibatalkan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi customer dapat menghapus pesanan CANCELLED |
| **Pre-condition** | Pesanan CANCELLED |
| **Langkah** | 1. Klik Hapus |
| **Expected Result** | Status 200, pesanan dihapus dari database |
| **Actual Result** | |
| **Status** | |

### TC-ORD-018: Hapus Pesanan - Bukan CANCELLED
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi hanya pesanan CANCELLED yang bisa dihapus |
| **Pre-condition** | Pesanan COMPLETED |
| **Expected Result** | Status 400, "Hanya pesanan dengan status dibatalkan yang dapat dihapus." |
| **Actual Result** | |
| **Status** | |

---

## MODUL 10: DASHBOARD

### TC-DSH-001: Dashboard Summary (Admin)
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi ringkasan dashboard admin |
| **Pre-condition** | Login sebagai admin |
| **Langkah** | 1. Buka `/dashboard` |
| **Expected Result** | Tampil: totalObat, transaksiHariIni, totalSupplier, totalPengguna |
| **Actual Result** | |
| **Status** | |

### TC-DSH-002: Dashboard Analytics
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi data analitik dashboard |
| **Pre-condition** | Login sebagai admin |
| **Expected Result** | Data: weeklySales, hourlySales, categories, lowStock, expiringSoon, recentTransactions |
| **Actual Result** | |
| **Status** | |

### TC-DSH-003: Dashboard Analytics - Filter Periode
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi filter tanggal pada analitik |
| **Data Uji** | `?startDate=2026-01-01&endDate=2026-01-31` |
| **Expected Result** | Data difilter sesuai periode |
| **Actual Result** | |
| **Status** | |

### TC-DSH-004: Dashboard Notifikasi
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi notifikasi stok menipis & obat kedaluwarsa |
| **Pre-condition** | Ada obat stok ≤10 dan/atau expired dalam 30 hari |
| **Expected Result** | List notifikasi LOW_STOCK dan EXPIRING_SOON |
| **Actual Result** | |
| **Status** | |

### TC-DSH-005: Dashboard Kasir
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi dashboard kasir menampilkan data yang sesuai |
| **Pre-condition** | Login sebagai kasir |
| **Langkah** | 1. Buka `/dashboard-kasir` |
| **Expected Result** | Data transaksi kasir ditampilkan |
| **Actual Result** | |
| **Status** | |

---

## MODUL 11: LAPORAN & EXPORT

### TC-RPT-001: Export Laporan Analitik (PDF)
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi export laporan analitik dalam format PDF |
| **Pre-condition** | Login sebagai admin/owner |
| **Langkah** | 1. Buka `/laporan` 2. Klik Export PDF |
| **Expected Result** | File PDF terdownload dengan data ringkasan, stok menipis, pembelian |
| **Actual Result** | |
| **Status** | |

### TC-RPT-002: Export Laporan Analitik (Excel)
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi export laporan format Excel |
| **Langkah** | 1. Klik Export Excel |
| **Expected Result** | File XLSX terdownload dengan sheet Ringkasan, Stok Menipis, Pembelian |
| **Actual Result** | |
| **Status** | |

### TC-RPT-003: Export Laporan Penjualan Kasir (PDF)
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi kasir dapat export laporan penjualan |
| **Pre-condition** | Login sebagai kasir |
| **Langkah** | 1. Buka `/laporan-kasir` 2. Klik Export PDF |
| **Expected Result** | File PDF dengan data transaksi kasir |
| **Actual Result** | |
| **Status** | |

### TC-RPT-004: Export Laporan Kasir (Excel)
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi export laporan kasir format Excel |
| **Expected Result** | File XLSX dengan sheet Ringkasan dan Transaksi |
| **Actual Result** | |
| **Status** | |

### TC-RPT-005: Export Laporan Dengan Filter Tanggal
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi data export sesuai filter tanggal |
| **Data Uji** | `?startDate=2026-05-01&endDate=2026-05-10&type=pdf` |
| **Expected Result** | Laporan hanya berisi data dalam rentang tanggal |
| **Actual Result** | |
| **Status** | |

### TC-RPT-006: Akses Laporan Oleh Owner
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi owner dapat mengakses halaman laporan |
| **Pre-condition** | Login sebagai owner |
| **Langkah** | 1. Buka `/laporan` |
| **Expected Result** | Halaman laporan analitik ditampilkan |
| **Actual Result** | |
| **Status** | |

---

## MODUL 12: PROFIL CUSTOMER & VERIFIKASI

### TC-PRF-001: Lihat Profil Customer
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi customer dapat melihat profilnya |
| **Pre-condition** | Login sebagai customer |
| **Expected Result** | Data profil: nama, email, phone, address, membership, riwayat belanja |
| **Actual Result** | |
| **Status** | |

### TC-PRF-002: Update Profil Customer
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi customer dapat mengupdate nama, phone, address |
| **Langkah** | 1. Edit profil 2. Ubah data 3. Simpan |
| **Expected Result** | Status 200, data diperbarui |
| **Actual Result** | |
| **Status** | |

### TC-PRF-003: Customer Akses Profil Orang Lain
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi customer tidak bisa melihat profil customer lain |
| **Expected Result** | Status 403 |
| **Actual Result** | |
| **Status** | |

### TC-PRF-004: Request OTP Ubah Email
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi customer dapat meminta OTP untuk ganti email |
| **Pre-condition** | Login sebagai customer |
| **Data Uji** | `{ newEmail: "newemail@test.com" }` |
| **Expected Result** | Status 200, OTP dikirim ke email lama |
| **Actual Result** | |
| **Status** | |

### TC-PRF-005: Ubah Email - Email Sudah Dipakai
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi email duplikat |
| **Data Uji** | `{ newEmail: "existing@test.com" }` |
| **Expected Result** | Status 409, "Email sudah digunakan oleh akun lain." |
| **Actual Result** | |
| **Status** | |

### TC-PRF-006: Verifikasi OTP & Ubah Email
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi email berhasil diubah setelah OTP valid |
| **Data Uji** | `{ verificationCode: "123456" }` |
| **Expected Result** | Status 200, email diperbarui, notifikasi dikirim ke email lama |
| **Actual Result** | |
| **Status** | |

### TC-PRF-007: Request OTP Ubah Password
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi customer dapat meminta OTP untuk ganti password |
| **Data Uji** | `{ currentPassword: "old123", newPassword: "new123", confirmPassword: "new123" }` |
| **Expected Result** | Status 200, OTP dikirim |
| **Actual Result** | |
| **Status** | |

### TC-PRF-008: Ubah Password - Password Lama Salah
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi password saat ini |
| **Data Uji** | `{ currentPassword: "wrongpass" }` |
| **Expected Result** | Status 401, "Password saat ini salah." |
| **Actual Result** | |
| **Status** | |

### TC-PRF-009: Verifikasi OTP & Ubah Password
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi password berhasil diubah |
| **Data Uji** | `{ verificationCode: "123456" }` |
| **Expected Result** | Status 200, password diperbarui |
| **Actual Result** | |
| **Status** | |

### TC-PRF-010: OTP Kedaluwarsa
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi OTP expired setelah 5 menit |
| **Pre-condition** | OTP sudah dikirim > 5 menit lalu |
| **Expected Result** | Status 400, "Kode verifikasi sudah kedaluwarsa." |
| **Actual Result** | |
| **Status** | |

---

## MODUL 13: OTORISASI & ROLE-BASED ACCESS

### TC-RBA-001: Admin Akses Semua Halaman Admin
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat mengakses semua fitur admin |
| **Halaman** | `/dashboard`, `/manajemen-stok`, `/manajemen-obat-racikan`, `/transaksi`, `/supplier`, `/pengadaan`, `/manajemen-pengguna`, `/laporan` |
| **Expected Result** | Semua halaman dapat diakses |
| **Actual Result** | |
| **Status** | |

### TC-RBA-002: Kasir Hanya Akses Halaman Kasir
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi kasir terbatas pada halaman kasir |
| **Halaman yang boleh** | `/dashboard-kasir`, `/transaksi-kasir`, `/laporan-kasir`, `/pengadaan` |
| **Halaman yang tidak boleh** | `/dashboard`, `/manajemen-stok`, `/manajemen-pengguna` |
| **Expected Result** | Halaman admin redirect ke dashboard kasir |
| **Actual Result** | |
| **Status** | |

### TC-RBA-003: Owner Hanya Akses Laporan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi owner hanya bisa akses laporan |
| **Halaman yang boleh** | `/laporan` |
| **Halaman yang tidak boleh** | `/dashboard`, `/manajemen-stok`, `/transaksi` |
| **Expected Result** | Halaman non-laporan redirect |
| **Actual Result** | |
| **Status** | |

### TC-RBA-004: Customer Hanya Akses Halaman Customer
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi customer terbatas pada dashboard customer |
| **Halaman yang boleh** | `/customer-dashboard`, `/order-success` |
| **Halaman yang tidak boleh** | `/dashboard`, `/dashboard-kasir`, `/manajemen-stok` |
| **Expected Result** | Redirect ke customer dashboard atau login |
| **Actual Result** | |
| **Status** | |

### TC-RBA-005: API restrictTo Middleware
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi middleware restrictTo memblokir role tidak sesuai |
| **Langkah** | 1. Login sebagai customer 2. Akses `PATCH /api/orders/:id/verify-payment` |
| **Expected Result** | Status 403, "Anda tidak memiliki akses ke resource ini." |
| **Actual Result** | |
| **Status** | |

---

## MODUL 14: CUSTOMER MEMBERSHIP

### TC-MBR-001: Lihat Daftar Customer (Admin)
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat melihat daftar semua customer dengan ringkasan |
| **Pre-condition** | Login sebagai admin |
| **Expected Result** | Daftar customer dengan totalPurchase, membershipStatus |
| **Actual Result** | |
| **Status** | |

### TC-MBR-002: Update Membership Status
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat mengubah status membership customer |
| **Data Uji** | `{ membershipStatus: "gold", isMember: true }` |
| **Expected Result** | Status 200, membership diperbarui |
| **Actual Result** | |
| **Status** | |

---

## MODUL 15: LANDING PAGE & NAVIGASI

### TC-NAV-001: Landing Page Tampil
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi landing page dapat diakses |
| **Langkah** | 1. Buka `/` |
| **Expected Result** | Halaman landing tampil dengan link ke login |
| **Actual Result** | |
| **Status** | |

### TC-NAV-002: Redirect Saat Sudah Login
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi redirect otomatis jika user sudah login |
| **Pre-condition** | Sudah login sebagai admin |
| **Langkah** | 1. Akses `/login` |
| **Expected Result** | Redirect ke `/dashboard` |
| **Actual Result** | |
| **Status** | |

### TC-NAV-003: Halaman Tidak Ditemukan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi akses ke route yang tidak ada |
| **Langkah** | 1. Akses `/halaman-tidak-ada` |
| **Expected Result** | Halaman kosong atau redirect ke landing |
| **Actual Result** | |
| **Status** | |

### TC-NAV-004: API Health Check
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi endpoint status API |
| **Langkah** | 1. `GET /api/status` |
| **Expected Result** | Status 200, `{ status: "OK", message: "API is up and running" }` |
| **Actual Result** | |
| **Status** | |
