# KUESIONER USER ACCEPTANCE TESTING (UAT)
## Sistem Informasi Manajemen Apotek Pemuda

**Tanggal Pengujian:** _______________  
**Nama Penguji:** _______________  
**Peran/Role:** ☐ Owner ☐ Admin ☐ Kasir ☐ Customer  
**Durasi Pengujian:** _______________

---

## SKALA PENILAIAN
- **5** = Sangat Setuju (Berfungsi sempurna, tidak ada masalah)
- **4** = Setuju (Berfungsi baik, ada kekurangan minor)
- **3** = Netral (Berfungsi dengan beberapa masalah)
- **2** = Tidak Setuju (Banyak masalah, perlu perbaikan)
- **1** = Sangat Tidak Setuju (Tidak berfungsi sama sekali)
- **N/A** = Tidak Berlaku

---

## BAB 1: MODUL AUTENTIKASI DAN PENGGUNA

### 1.1 Registrasi Akun

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 1.1.1 | Proses registrasi akun pelanggan mudah dan intuitif | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.1.2 | Validasi input data registrasi berfungsi dengan baik (email, username, password) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.1.3 | Pesan error registrasi jelas dan membantu pengguna | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.1.4 | Akun tidak boleh duplikat untuk username atau email yang sama | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.1.5 | Sistem mengirimkan email verifikasi OTP setelah registrasi | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.1.6 | Format email verifikasi jelas dan profesional | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 1.2 Login & Logout

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 1.2.1 | Proses login mudah dengan username dan password | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.2.2 | Sistem menampilkan pesan error yang jelas jika login gagal | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.2.3 | Setelah login berhasil, user diarahkan ke dashboard yang sesuai dengan role | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.2.4 | Proses logout berfungsi dan user berhasil keluar dari sistem | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.2.5 | Session otomatis logout setelah periode idle tertentu | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.2.6 | Setelah logout, user tidak bisa mengakses halaman yang membutuhkan autentikasi | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 1.3 Reset Password

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 1.3.1 | Fitur "Lupa Password" mudah ditemukan dan digunakan | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.3.2 | Sistem mengirimkan OTP reset password ke email yang terdaftar | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.3.3 | Format email reset password jelas dan profesional | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.3.4 | User dapat mengubah password dengan OTP yang dikirimkan | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.3.5 | Password baru harus berbeda dengan password lama | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.3.6 | Email notifikasi perubahan password terkirim ke user | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 1.4 Manajemen Profil Pengguna

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 1.4.1 | User dapat melihat dan mengubah profil pribadi mereka | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.4.2 | Admin dapat membuat, mengubah, dan menghapus akun pengguna | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.4.3 | Admin dapat mengelola role pengguna (Owner, Admin, Kasir, Customer) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.4.4 | Data profil pengguna disimpan dengan aman | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.4.5 | Admin dapat melihat list semua pengguna dengan filter yang relevan | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 1.4.6 | Sistem mencatat log perubahan data pengguna | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

---

## BAB 2: MODUL MANAJEMEN OBAT

### 2.1 Input & Pencatatan Obat

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 2.1.1 | Admin dapat menambah obat baru dengan lengkap (nama, harga, stok, kategori) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 2.1.2 | Sistem mendukung kategori obat (BEBAS, BEBAS TERBATAS, KERAS) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 2.1.3 | Validasi input obat berfungsi (tidak boleh harga negatif, stok negatif, dll) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 2.1.4 | Sistem menampilkan pesan sukses/error yang jelas saat menambah obat | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 2.1.5 | Admin dapat mengubah data obat yang sudah ada | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 2.1.6 | Admin dapat menghapus obat dari sistem | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 2.2 Pencatatan Tanggal Kadaluarsa & Stock

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 2.2.1 | Sistem dapat mencatat tanggal kadaluarsa obat | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 2.2.2 | Sistem secara otomatis mengidentifikasi obat yang sudah kadaluarsa | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 2.2.3 | Admin mendapat notifikasi obat yang akan kadaluarsa (warning) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 2.2.4 | Sistem menampilkan stok obat secara real-time dan akurat | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 2.2.5 | Admin mendapat alert jika stok obat mencapai tingkat minimum | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 2.2.6 | Sistem mencegah penjualan obat yang sudah kadaluarsa | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 2.3 Pencarian dan Filter Obat

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 2.3.1 | Fitur pencarian obat berdasarkan nama berfungsi dengan cepat | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 2.3.2 | Dapat filter obat berdasarkan kategori (BEBAS, BEBAS TERBATAS, KERAS) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 2.3.3 | Dapat filter obat berdasarkan supplier/produsen | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 2.3.4 | Dapat filter obat berdasarkan harga (range) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 2.3.5 | Hasil pencarian ditampilkan dengan pagination yang efektif | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 2.3.6 | Informasi obat ditampilkan lengkap (nama, harga, stok, kategori, dll) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

---

## BAB 3: MODUL MANAJEMEN SUPPLIER

### 3.1 Input Data Supplier

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 3.1.1 | Admin dapat menambah supplier baru dengan lengkap (nama, kontak, alamat) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 3.1.2 | Validasi input supplier berfungsi (tidak boleh nama duplikat, dll) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 3.1.3 | Admin dapat mengubah data supplier | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 3.1.4 | Admin dapat menghapus supplier dari sistem | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 3.1.5 | Sistem menampilkan list supplier dengan filter dan pencarian | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 3.1.6 | Informasi supplier ditampilkan lengkap (nama, kontak, email, alamat) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 3.2 Hubungan Supplier dengan Obat

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 3.2.1 | Sistem dapat mengasosiasikan obat dengan supplier | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 3.2.2 | Admin dapat melihat daftar obat dari supplier tertentu | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 3.2.3 | Sistem mencegah penghapusan supplier jika masih memiliki obat aktif | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 3.2.4 | Admin dapat melihat history pembelian dari supplier | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 3.2.5 | Sistem menyimpan harga beli obat dari supplier (purchase price) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

---

## BAB 4: MODUL TRANSAKSI PENJUALAN

### 4.1 Penjualan Offline (Kasir)

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 4.1.1 | Kasir dapat memproses penjualan dengan mudah melalui interface yang user-friendly | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.1.2 | Kasir dapat mencari dan menambahkan obat ke keranjang transaksi | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.1.3 | Sistem dapat menghitung total harga dengan benar | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.1.4 | Kasir dapat mengubah jumlah atau menghapus item dari transaksi | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.1.5 | Sistem mendukung berbagai metode pembayaran (cash, debit, kredit, dll) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.1.6 | Sistem dapat menghitung kembalian dengan benar | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.1.7 | Sistem menampilkan struk penjualan dan dapat dicetak | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.1.8 | Stok otomatis berkurang setelah transaksi berhasil | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 4.2 Penjualan Obat Resep (Keras)

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 4.2.1 | Sistem dapat menangani penjualan obat kategori KERAS dengan aturan khusus | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.2.2 | Kasir dapat meminta/upload resep dokter untuk obat KERAS | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.2.3 | Sistem mencatat informasi pasien (nama, alamat, umur, dll) untuk obat KERAS | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.2.4 | Sistem mencegah penjualan obat KERAS tanpa resep yang valid | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.2.5 | Admin dapat melihat history penjualan obat KERAS | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 4.3 Program Membership Customer

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 4.3.1 | Customer dapat mendaftar membership dan mendapat member ID | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.3.2 | Sistem memberikan diskon untuk member yang melakukan pembelian | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.3.3 | Member mendapat poin reward dari setiap pembelian | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.3.4 | Member dapat menukar poin reward dengan diskon/produk | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.3.5 | Sistem menampilkan status membership customer dengan jelas | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 4.3.6 | Admin dapat mengelola program membership (level, benefit, dll) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

---

## BAB 5: MODUL OBAT RACIKAN (CUSTOM MEDICINE)

### 5.1 Pembuatan Obat Racikan

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 5.1.1 | Sistem dapat membuat obat racikan baru dari kombinasi obat yang ada | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 5.1.2 | User dapat memasukkan nama racikan dan daftar komponen obat | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 5.1.3 | Sistem dapat menghitung harga racikan dari komponen obatnya | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 5.1.4 | Sistem dapat mencatat stok obat racikan | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 5.1.5 | User dapat mengubah dan menghapus resep obat racikan | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 5.2 Penjualan Obat Racikan

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 5.2.1 | Obat racikan dapat dijual seperti obat normal | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 5.2.2 | Stok komponen obat otomatis berkurang saat obat racikan terjual | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 5.2.3 | Sistem mencegah penjualan racikan jika stok komponen tidak cukup | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 5.2.4 | Struk penjualan menampilkan informasi racikan dengan jelas | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

---

## BAB 6: MODUL PESANAN ONLINE

### 6.1 Katalog Online & Browsing

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 6.1.1 | Customer dapat melihat katalog obat online dengan informasi lengkap | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.1.2 | Fitur pencarian obat online berfungsi dengan efektif | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.1.3 | Filter obat online (kategori, harga, rating) berfungsi dengan baik | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.1.4 | Informasi stok obat ditampilkan real-time | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.1.5 | Sistem tidak menampilkan obat yang sudah kadaluarsa di katalog | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.1.6 | Customer dapat melihat deskripsi, harga, dan ulasan produk | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 6.2 Keranjang Belanja (Cart)

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 6.2.1 | Customer dapat menambahkan obat ke keranjang belanja | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.2.2 | Keranjang belanja menampilkan daftar obat yang dipilih | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.2.3 | Customer dapat mengubah jumlah atau menghapus obat dari keranjang | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.2.4 | Sistem menghitung total harga dengan benar (termasuk diskon jika ada) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.2.5 | Customer dapat melihat ringkasan belanja sebelum checkout | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.2.6 | Keranjang belanja dapat disimpan dan diakses kembali nanti | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 6.3 Proses Checkout & Pembayaran Online

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 6.3.1 | Customer dapat melakukan checkout dengan mudah | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.3.2 | Sistem meminta alamat pengiriman dan nomor telepon | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.3.3 | Sistem mendukung berbagai metode pembayaran online (e-wallet, transfer bank, dll) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.3.4 | Sistem dapat menampilkan kode pembayaran/invoice untuk customer | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.3.5 | Customer dapat mengupload bukti pembayaran | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.3.6 | Sistem mengenkripsi informasi pembayaran dengan aman | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 6.4 Manajemen Order (Status & Tracking)

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 6.4.1 | Sistem dapat membuat order dan memberikan nomor order yang unik | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.4.2 | Status order dapat berubah (PENDING, VERIFIED, COMPLETED, CANCELLED) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.4.3 | Customer dapat melihat status order mereka secara real-time | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.4.4 | Admin dapat melihat daftar semua order dengan filter status | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.4.5 | Admin dapat memverifikasi dan mengubah status order | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.4.6 | Sistem mengirimkan notifikasi email kepada customer saat status order berubah | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.4.7 | Customer dapat membatalkan order yang masih PENDING | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 6.4.8 | Sistem dapat menangani retur/pengembalian untuk order yang bermasalah | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

---

## BAB 7: MODUL PENGADAAN (PURCHASE)

### 7.1 Input Pesanan Pembelian

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 7.1.1 | Admin dapat membuat purchase order ke supplier dengan mudah | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 7.1.2 | Sistem dapat menambahkan obat ke purchase order | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 7.1.3 | Admin dapat menentukan jumlah dan harga beli obat | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 7.1.4 | Sistem menghitung total harga purchase order dengan benar | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 7.1.5 | Admin dapat mengubah atau menghapus purchase order yang belum dikonfirmasi | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 7.1.6 | Sistem dapat menyimpan informasi tanggal kadaluarsa obat di purchase order | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 7.2 Penerimaan Barang (Goods Receive)

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 7.2.1 | Admin dapat membuat Goods Receipt saat barang dari supplier tiba | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 7.2.2 | Sistem memverifikasi barang yang diterima sesuai purchase order | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 7.2.3 | Admin dapat menginput jumlah barang yang benar-benar diterima | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 7.2.4 | Admin dapat mencatat ketidaksesuaian barang (quantity atau kualitas) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 7.2.5 | Stok otomatis bertambah setelah Goods Receipt dikonfirmasi | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 7.2.6 | Sistem mencatat tanggal penerimaan dan expired date obat | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 7.3 Manajemen Purchase Order

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 7.3.1 | Admin dapat melihat daftar purchase order dengan berbagai status | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 7.3.2 | Sistem dapat mencari purchase order berdasarkan supplier atau nomor PO | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 7.3.3 | Admin dapat melihat detail purchase order dan goods receipt history | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 7.3.4 | Sistem dapat mengidentifikasi obat yang belum diterima dari purchase order | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 7.3.5 | Admin dapat membuat adjustment jika ada perbedaan barang | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

---

## BAB 8: MODUL DASHBOARD & LAPORAN

### 8.1 Dashboard

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 8.1.1 | Dashboard menampilkan ringkasan data penting (total penjualan, stok, dll) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.1.2 | Dashboard menampilkan grafik penjualan per hari/bulan/tahun | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.1.3 | Dashboard menampilkan obat yang paling banyak terjual | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.1.4 | Dashboard menampilkan obat dengan stok terendah (warning) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.1.5 | Dashboard menampilkan obat yang akan kadaluarsa (alert) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.1.6 | Dashboard dapat diakses dengan cepat dan tampilan responsif | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.1.7 | Owner dapat melihat total keuntungan/laba yang dihasilkan | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 8.2 Laporan Penjualan

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 8.2.1 | Admin dapat membuat laporan penjualan berdasarkan periode (harian, mingguan, bulanan) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.2.2 | Laporan penjualan menampilkan total revenue dan jumlah transaksi | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.2.3 | Laporan penjualan dapat difilter berdasarkan kategori obat atau kasir | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.2.4 | Laporan penjualan menampilkan obat yang paling/terendah penjualan | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.2.5 | Laporan dapat diexport ke format PDF atau Excel | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 8.3 Laporan Stok

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 8.3.1 | Admin dapat membuat laporan stok obat saat ini | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.3.2 | Laporan stok menampilkan detail setiap obat (nama, quantity, harga) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.3.3 | Laporan stok menampilkan nilai total inventori (stok × harga) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.3.4 | Laporan stok dapat difilter berdasarkan kategori atau supplier | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.3.5 | Laporan menampilkan obat yang sudah/akan kadaluarsa | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.3.6 | Laporan dapat diexport ke format PDF atau Excel | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 8.4 Laporan Pengadaan (Purchase)

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 8.4.1 | Admin dapat membuat laporan pembelian obat dari supplier | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.4.2 | Laporan pembelian menampilkan total biaya pembelian | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.4.3 | Laporan dapat difilter berdasarkan supplier atau periode | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.4.4 | Laporan menampilkan efisiensi pembelian (margin keuntungan) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.4.5 | Laporan dapat diexport ke format PDF atau Excel | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 8.5 Laporan Pelanggan & Membership

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 8.5.1 | Admin dapat melihat laporan customer (total member, transaksi per member) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.5.2 | Laporan menampilkan customer paling setia (top spender) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.5.3 | Laporan dapat difilter berdasarkan periode atau membership level | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 8.5.4 | Laporan dapat diexport ke format PDF atau Excel | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

---

## BAB 9: KEAMANAN & PERFORMA

### 9.1 Keamanan Data

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 9.1.1 | Password pengguna disimpan dengan aman (hashing/encryption) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 9.1.2 | Sistem mengimplementasikan kontrol akses berbasis role (RBAC) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 9.1.3 | Data sensitif (pembayaran, resep) dienkripsi dengan baik | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 9.1.4 | Sistem mencatat audit log untuk setiap aktivitas penting | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 9.1.5 | Sistem memiliki backup data secara berkala | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 9.1.6 | Sistem dapat dipulihkan dari backup jika ada data loss | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 9.2 Performa & Stabilitas

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 9.2.1 | Sistem loading halaman cepat (< 3 detik) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 9.2.2 | Fitur pencarian responsif dan hasil ditampilkan cepat | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 9.2.3 | Sistem stabil dan tidak sering error/crash | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 9.2.4 | Sistem dapat menangani banyak user secara bersamaan (concurrent users) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 9.2.5 | API backend responsif dan tidak timeout | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 9.2.6 | Sistem memiliki error handling yang baik dan user-friendly | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 9.3 Kompatibilitas & Responsivitas

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 9.3.1 | Interface berfungsi baik di berbagai browser (Chrome, Firefox, Safari, Edge) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 9.3.2 | Interface responsif dan dapat diakses dari mobile/tablet | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 9.3.3 | Sistem dapat diakses dari berbagai perangkat dengan OS berbeda | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

---

## BAB 10: USER INTERFACE & USABILITY

### 10.1 Interface Design

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 10.1.1 | Interface user-friendly dan mudah dipahami | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 10.1.2 | Navigasi menu intuitif dan mudah ditemukan | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 10.1.3 | Warna dan font konsisten dan nyaman dipandang | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 10.1.4 | Icon dan button jelas dan mudah dipahami | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 10.1.5 | Form input jelas dengan label dan validasi yang baik | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 10.2 User Guidance

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 10.2.1 | Sistem memberikan tooltip/help untuk fitur-fitur penting | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 10.2.2 | Pesan error jelas dan membantu user mengatasi masalah | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 10.2.3 | Sistem memiliki dokumentasi/panduan pengguna yang lengkap | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 10.2.4 | Tersedia bantuan/support untuk user jika ada masalah | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 10.3 Accessibility

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 10.3.1 | Interface dapat diakses oleh user dengan kebutuhan khusus | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 10.3.2 | Sistem mendukung zoom/resize untuk pengguna dengan penglihatan rendah | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 10.3.3 | Sistem dapat diakses menggunakan keyboard (tidak hanya mouse) | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

---

## BAB 11: PENILAIAN UMUM & SARAN

### 11.1 Penilaian Keseluruhan

| No. | Pertanyaan | Rating | Keterangan |
|-----|-----------|--------|-----------|
| 11.1.1 | Sistem secara keseluruhan memenuhi kebutuhan bisnis | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 11.1.2 | Sistem siap untuk digunakan secara produksi | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 11.1.3 | ROI sistem ini baik dan menguntungkan bagi bisnis | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |
| 11.1.4 | User puas dengan performa dan fitur sistem | ☐5 ☐4 ☐3 ☐2 ☐1 ☐N/A | |

### 11.2 Saran & Catatan

**Catatan Positif (Kekuatan):**
```
[Tulis kekuatan/hal positif dari sistem]
```

**Area untuk Perbaikan (Kelemahan):**
```
[Tulis area yang perlu diperbaiki]
```

**Fitur yang Hilang atau Diinginkan:**
```
[Tulis fitur tambahan yang diinginkan]
```

**Rekomendasi:**
```
[Tulis rekomendasi untuk improvement sistem]
```

---

## RINGKASAN HASIL PENGUJIAN

### Statistik Penilaian
- **Total Pertanyaan:** ________
- **Rata-rata Rating:** ________
- **Persentase Positif (Rating 4-5):** ________%
- **Persentase Neutral (Rating 3):** ________%
- **Persentase Negatif (Rating 1-2):** ________%

### Keputusan Akhir UAT
- ☐ **LULUS** - Sistem siap untuk go-live
- ☐ **LULUS DENGAN CATATAN** - Sistem siap dengan kondisi tertentu
- ☐ **TIDAK LULUS** - Sistem perlu perbaikan signifikan sebelum go-live

### Catatan Keputusan:
```
[Tulis catatan mengenai keputusan akhir]
```

---

## TANDA TANGAN

| Jabatan | Nama | Tanggal | Tanda Tangan |
|---------|------|--------|-------------|
| Penguji/User | | | |
| Coordinator UAT | | | |
| Project Manager | | | |
| Stakeholder | | | |

---

**Dokumen ini adalah hasil dari User Acceptance Testing untuk Sistem Informasi Manajemen Apotek Pemuda.**  
**Versi: 1.0** | **Tanggal: 2026-06-16** | **Status: Draft**
