# Test Case - Sistem Manajemen Apotek Pemuda
## Bagian 2: Supplier, Obat Racikan, & Pengadaan

---

## MODUL 5: MANAJEMEN SUPPLIER

### TC-SUP-001: Lihat Semua Supplier
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat melihat daftar supplier |
| **Pre-condition** | Login sebagai admin |
| **Langkah** | 1. Buka halaman `/supplier` |
| **Expected Result** | Status 200, daftar supplier ditampilkan |
| **Actual Result** | |
| **Status** | |

### TC-SUP-002: Tambah Supplier Baru
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat menambah supplier |
| **Pre-condition** | Login sebagai admin |
| **Langkah** | 1. Klik Tambah Supplier 2. Isi form 3. Submit |
| **Data Uji** | `{ name: "PT Kimia Farma", contactPerson: "Budi", phone: "08123456", email: "kimia@farma.com", address: "Jl. Raya 1" }` |
| **Expected Result** | Status 201, supplier muncul di daftar |
| **Actual Result** | |
| **Status** | |

### TC-SUP-003: Tambah Supplier - Nama Kosong
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi nama supplier wajib diisi |
| **Pre-condition** | Login sebagai admin |
| **Langkah** | 1. Submit form supplier tanpa nama |
| **Expected Result** | Status 400, pesan "Nama supplier harus diisi." |
| **Actual Result** | |
| **Status** | |

### TC-SUP-004: Edit Supplier
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat mengedit data supplier |
| **Pre-condition** | Supplier sudah ada |
| **Langkah** | 1. Klik Edit pada supplier 2. Ubah data 3. Simpan |
| **Expected Result** | Status 200, data berhasil diperbarui |
| **Actual Result** | |
| **Status** | |

### TC-SUP-005: Edit Supplier Tidak Ditemukan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi respons untuk ID supplier tidak valid |
| **Langkah** | 1. `PUT /api/suppliers/99999` |
| **Expected Result** | Status 404 |
| **Actual Result** | |
| **Status** | |

### TC-SUP-006: Hapus Supplier
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat menghapus supplier |
| **Langkah** | 1. Klik Hapus 2. Konfirmasi |
| **Expected Result** | Status 200, supplier dihapus |
| **Actual Result** | |
| **Status** | |

### TC-SUP-007: Hapus Supplier Yang Punya Relasi Pengadaan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi supplier dengan riwayat pengadaan tidak bisa dihapus |
| **Pre-condition** | Supplier memiliki data pembelian terkait |
| **Langkah** | 1. Hapus supplier yang masih punya pengadaan |
| **Expected Result** | Error/gagal karena constraint ON DELETE RESTRICT |
| **Actual Result** | |
| **Status** | |

---

## MODUL 6: MANAJEMEN OBAT RACIKAN

### TC-CM-001: Lihat Semua Obat Racikan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat melihat daftar obat racikan beserta komposisi |
| **Pre-condition** | Login sebagai admin |
| **Langkah** | 1. Buka `/manajemen-obat-racikan` |
| **Expected Result** | Status 200, daftar obat racikan dengan komposisi ditampilkan |
| **Actual Result** | |
| **Status** | |

### TC-CM-002: Tambah Obat Racikan Baru
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat membuat obat racikan |
| **Pre-condition** | Login sebagai admin, obat bahan baku sudah ada |
| **Langkah** | 1. Klik Tambah 2. Isi nama, harga, stok, komposisi 3. Submit |
| **Data Uji** | `{ nama: "Racikan Batuk", harga: 25000, stok: 10, komposisi: [{ drugId: 1, jumlah: 2, satuan: "tablet" }] }` |
| **Expected Result** | Status 201, obat racikan baru muncul di daftar |
| **Actual Result** | |
| **Status** | |

### TC-CM-003: Tambah Racikan - Tanpa Komposisi
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi komposisi wajib minimal 1 bahan |
| **Data Uji** | `{ nama: "Racikan X", komposisi: [] }` |
| **Expected Result** | Status 400, pesan "Nama obat dan komposisi (minimal 1 bahan) harus diisi." |
| **Actual Result** | |
| **Status** | |

### TC-CM-004: Tambah Racikan - Bahan Tidak Ditemukan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi jika bahan racikan tidak ada di database |
| **Data Uji** | `{ komposisi: [{ bahan: "ObatTidakAda", jumlah: 1, satuan: "tablet" }] }` |
| **Expected Result** | Error, pesan bahan racikan tidak ditemukan |
| **Actual Result** | |
| **Status** | |

### TC-CM-005: Edit Obat Racikan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat mengedit obat racikan (nama, harga, komposisi) |
| **Pre-condition** | Obat racikan sudah ada |
| **Langkah** | 1. Klik Edit 2. Ubah data 3. Simpan |
| **Expected Result** | Status 200, data berhasil diperbarui, komposisi lama diganti |
| **Actual Result** | |
| **Status** | |

### TC-CM-006: Hapus Obat Racikan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat menghapus obat racikan |
| **Langkah** | 1. Klik Hapus 2. Konfirmasi |
| **Expected Result** | Status 200, obat racikan dan komponen dihapus (CASCADE) |
| **Actual Result** | |
| **Status** | |

### TC-CM-007: Lihat Detail Obat Racikan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi detail obat racikan berdasarkan ID |
| **Langkah** | 1. `GET /api/custom-medicine/:id` |
| **Expected Result** | Status 200, data lengkap dengan komposisi |
| **Actual Result** | |
| **Status** | |

### TC-CM-008: Transaksi Obat Racikan (Offline)
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi kasir dapat mencatat penjualan obat racikan |
| **Pre-condition** | Obat racikan ada, stok cukup |
| **Data Uji** | `{ quantity: 2 }` |
| **Expected Result** | Status 201, stok racikan berkurang, stok bahan baku berkurang |
| **Actual Result** | |
| **Status** | |

### TC-CM-009: Transaksi Racikan - Stok Tidak Cukup
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi stok racikan tidak mencukupi |
| **Pre-condition** | Stok obat racikan = 1 |
| **Data Uji** | `{ quantity: 5 }` |
| **Expected Result** | Status 400, pesan stok tidak mencukupi |
| **Actual Result** | |
| **Status** | |

### TC-CM-010: Transaksi Racikan - Stok Bahan Baku Tidak Cukup
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi stok bahan baku saat transaksi racikan |
| **Pre-condition** | Stok racikan cukup, tapi stok salah satu bahan habis |
| **Expected Result** | Error, pesan stok bahan tidak mencukupi |
| **Actual Result** | |
| **Status** | |

---

## MODUL 7: MANAJEMEN PENGADAAN

### TC-PUR-001: Lihat Semua Pengadaan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin/kasir dapat melihat riwayat pengadaan |
| **Pre-condition** | Login sebagai admin atau kasir |
| **Langkah** | 1. Buka halaman `/pengadaan` |
| **Expected Result** | Status 200, daftar pengadaan dengan kode, supplier, total harga |
| **Actual Result** | |
| **Status** | |

### TC-PUR-002: Buat Pengadaan Baru
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi admin dapat mencatat pengadaan obat |
| **Pre-condition** | Login sebagai admin, supplier & obat ada |
| **Langkah** | 1. Klik Tambah Pengadaan 2. Pilih supplier 3. Tambah item 4. Submit |
| **Data Uji** | `{ supplierId: 1, items: [{ drugId: 1, quantity: 50, unitPrice: 4000 }] }` |
| **Expected Result** | Status 201, pengadaan tercatat, stok obat bertambah 50 |
| **Actual Result** | |
| **Status** | |

### TC-PUR-003: Pengadaan - Stok Otomatis Bertambah
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi stok obat bertambah setelah pengadaan |
| **Pre-condition** | Stok obat awal = 100 |
| **Data Uji** | `{ items: [{ drugId: 1, quantity: 25, unitPrice: 5000 }] }` |
| **Expected Result** | Stok obat menjadi 125 |
| **Actual Result** | |
| **Status** | |

### TC-PUR-004: Pengadaan - Supplier Tidak Valid
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi supplierId yang tidak ada |
| **Data Uji** | `{ supplierId: 99999 }` |
| **Expected Result** | Status 400, pesan "Supplier tidak ditemukan." |
| **Actual Result** | |
| **Status** | |

### TC-PUR-005: Pengadaan - Item Obat Tidak Valid
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi drugId yang tidak ada |
| **Data Uji** | `{ items: [{ drugId: 99999, quantity: 10, unitPrice: 5000 }] }` |
| **Expected Result** | Error, obat tidak ditemukan |
| **Actual Result** | |
| **Status** | |

### TC-PUR-006: Pengadaan - Quantity 0 atau Negatif
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi jumlah item harus positif |
| **Data Uji** | `{ items: [{ drugId: 1, quantity: 0, unitPrice: 5000 }] }` |
| **Expected Result** | Status 400, pesan "Jumlah item pengadaan harus lebih dari 0." |
| **Actual Result** | |
| **Status** | |

### TC-PUR-007: Pengadaan - Item Kosong
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi validasi item tidak boleh kosong |
| **Data Uji** | `{ supplierId: 1, items: [] }` |
| **Expected Result** | Status 400, pesan "Item pengadaan tidak boleh kosong." |
| **Actual Result** | |
| **Status** | |

### TC-PUR-008: Lihat Detail Pengadaan
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi detail pengadaan berdasarkan ID |
| **Langkah** | 1. `GET /api/purchases/:id` |
| **Expected Result** | Status 200, detail pengadaan dengan items |
| **Actual Result** | |
| **Status** | |

### TC-PUR-009: Pengadaan Multi-Item
| Item | Detail |
|------|--------|
| **Deskripsi** | Verifikasi pengadaan dengan beberapa obat sekaligus |
| **Data Uji** | `{ items: [{ drugId: 1, quantity: 10, unitPrice: 5000 }, { drugId: 2, quantity: 20, unitPrice: 3000 }] }` |
| **Expected Result** | Total harga = (10×5000)+(20×3000) = 110000, kedua stok obat bertambah |
| **Actual Result** | |
| **Status** | |
