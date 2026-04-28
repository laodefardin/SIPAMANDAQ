# 📘 PANDUAN INSTALASI SIPAMANDAQ
### Sistem Manajemen Arsip Dokumen — Program Studi PTI

> **Estimasi Waktu:** ±15 menit  
> **Tingkat Kesulitan:** Pemula  
> **Prasyarat:** Akun Google (Gmail) aktif

---

## 📋 Daftar Isi

1. [Persiapan Awal](#1-persiapan-awal)
2. [Membuat Database (Google Spreadsheet)](#2-membuat-database-google-spreadsheet)
3. [Membuat Storage (Google Drive Folder)](#3-membuat-storage-google-drive-folder)
4. [Membuat Project Google Apps Script](#4-membuat-project-google-apps-script)
5. [Menyalin Kode ke Project](#5-menyalin-kode-ke-project)
6. [Konfigurasi ID](#6-konfigurasi-id)
7. [Menjalankan Setup Awal](#7-menjalankan-setup-awal)
8. [Deploy sebagai Web App](#8-deploy-sebagai-web-app)
9. [Pengujian Aplikasi](#9-pengujian-aplikasi)
10. [Troubleshooting](#10-troubleshooting)
11. [Update & Maintenance](#11-update--maintenance)

---

## 1. Persiapan Awal

### Yang Anda Butuhkan
- ✅ Akun Google (Gmail) — akun ini akan menjadi **pemilik** sistem
- ✅ Browser modern (Chrome/Edge/Firefox)
- ✅ Koneksi internet stabil
- ✅ Folder `gas_project/` yang berisi 11 file kode SIPAMANDAQ

### Daftar File yang Harus Disiapkan

| No | Nama File | Tipe | Deskripsi |
|----|-----------|------|-----------|
| 1 | `Config.gs` | Script | Konfigurasi sistem |
| 2 | `Code.gs` | Script | Entry point aplikasi |
| 3 | `Auth.gs` | Script | Autentikasi & session |
| 4 | `Database.gs` | Script | Operasi CRUD dokumen |
| 5 | `UserManager.gs` | Script | Manajemen user |
| 6 | `FileManager.gs` | Script | Manajemen file Drive |
| 7 | `Setup.gs` | Script | Setup database awal |
| 8 | `Login.html` | HTML | Halaman login |
| 9 | `App.html` | HTML | Halaman utama (SPA) |
| 10 | `StyleCSS.html` | HTML | Stylesheet bersama |
| 11 | `JavaScript.html` | HTML | Logic client-side |

---

## 2. Membuat Database (Google Spreadsheet)

Google Spreadsheet akan berfungsi sebagai **database** penyimpanan seluruh data pengguna dan metadata dokumen.

### Langkah-langkah:

1. Buka browser, lalu akses **[sheets.google.com](https://sheets.google.com)**
2. Login dengan akun Google Anda (jika belum login)
3. Klik tombol **`+ Blank`** (Kosong) untuk membuat spreadsheet baru

4. **Ubah nama spreadsheet:**
   - Klik tulisan `Untitled spreadsheet` di pojok kiri atas
   - Ketik: `SIPAMANDAQ_DB`
   - Tekan **Enter**

5. **Salin ID Spreadsheet:**
   - Perhatikan URL di address bar browser, formatnya seperti ini:
   ```
   https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit
                                           └──────────────────────────────┘
                                              INI ADALAH ID SPREADSHEET
   ```
   - **Salin (Ctrl+C)** bagian ID tersebut (antara `/d/` dan `/edit`)
   - **Simpan di Notepad** — Anda akan membutuhkannya di Langkah 6

> [!IMPORTANT]
> Jangan tutup tab Spreadsheet ini. Anda bisa melihat hasilnya nanti setelah setup.

---

## 3. Membuat Storage (Google Drive Folder)

Google Drive Folder akan berfungsi sebagai **storage** penyimpanan seluruh file dokumen yang diupload.

### Langkah-langkah:

1. Buka **[drive.google.com](https://drive.google.com)**
2. Di panel kiri, klik tombol **`+ New`** (Baru)
3. Pilih **`Folder`** (Folder)
4. Beri nama folder: `SIPAMANDAQ_FILES`
5. Klik **`Create`** (Buat)

6. **Buka folder** yang baru dibuat (double-click)

7. **Salin ID Folder:**
   - Perhatikan URL di address bar, formatnya seperti ini:
   ```
   https://drive.google.com/drive/folders/1xYzAbCdEfGhIjKlMnOpQrS
                                            └──────────────────────┘
                                               INI ADALAH ID FOLDER
   ```
   - **Salin (Ctrl+C)** bagian ID tersebut (setelah `/folders/`)
   - **Simpan di Notepad** — bersama ID Spreadsheet dari langkah sebelumnya

> [!TIP]
> Sekarang Anda seharusnya sudah memiliki **2 ID** yang tersimpan di Notepad:
> - ID Spreadsheet: `1aBcDeFgHiJkLmN...` (contoh)
> - ID Folder: `1xYzAbCdEfGhIjK...` (contoh)

---

## 4. Membuat Project Google Apps Script

Google Apps Script adalah platform tempat kode backend SIPAMANDAQ akan dijalankan.

### Langkah-langkah:

1. Buka **[script.google.com](https://script.google.com)**
2. Klik tombol **`+ New Project`** (Proyek Baru) di pojok kiri atas
3. Sebuah editor kode akan terbuka dengan file `Code.gs` default

4. **Ubah nama project:**
   - Klik tulisan `Untitled project` di pojok kiri atas
   - Ketik: `SIPAMANDAQ`
   - Tekan **Enter**

5. **Hapus isi** file `Code.gs` yang ada (pilih semua teks lalu delete)
   - Jangan tutup tab ini, lanjut ke langkah berikutnya

---

## 5. Menyalin Kode ke Project

Sekarang saatnya menyalin seluruh kode dari folder `gas_project/` ke project GAS.

### 5.1 — File Script (.gs)

Untuk setiap file `.gs`, lakukan:

1. **Buat file baru di GAS:** Klik **`+`** (tombol plus) di sidebar kiri panel Files → pilih **`Script`**
2. **Rename** file sesuai nama (tanpa ekstensi `.gs`)
3. **Buka file** dari folder `gas_project/` menggunakan teks editor (Notepad/VS Code)
4. **Salin seluruh isi** (Ctrl+A → Ctrl+C)
5. **Tempel** ke editor GAS (Ctrl+V)
6. Tekan **Ctrl+S** untuk menyimpan

> [!WARNING]
> File `Code.gs` sudah ada secara default. Jangan buat duplikat!  
> Cukup **hapus isinya** lalu **tempel** kode dari file `Code.gs` Anda.

**Urutkan pembuatan file seperti berikut:**

| Urutan | Aksi | Nama di GAS Editor |
|--------|------|--------------------|
| 1 | Tempel ke `Code.gs` yang sudah ada | `Code` |
| 2 | Buat Script baru → rename | `Config` |
| 3 | Buat Script baru → rename | `Auth` |
| 4 | Buat Script baru → rename | `Database` |
| 5 | Buat Script baru → rename | `UserManager` |
| 6 | Buat Script baru → rename | `FileManager` |
| 7 | Buat Script baru → rename | `Setup` |

### 5.2 — File HTML (.html)

Untuk setiap file `.html`, lakukan:

1. Klik **`+`** di sidebar kiri panel Files → pilih **`HTML`**
2. **Rename** file sesuai nama (**tanpa** ekstensi `.html` — GAS otomatis menambahkannya)
3. **Hapus seluruh isi template** yang dibuatkan GAS
4. **Tempel** kode dari file `.html` yang sesuai
5. Tekan **Ctrl+S**

| Urutan | Nama di GAS Editor |
|--------|--------------------|
| 8 | `Login` |
| 9 | `App` |
| 10 | `StyleCSS` |
| 11 | `JavaScript` |

### Verifikasi

Setelah selesai, panel Files di sidebar kiri seharusnya menampilkan **11 file:**

```
📄 Code.gs
📄 Config.gs  
📄 Auth.gs
📄 Database.gs
📄 UserManager.gs
📄 FileManager.gs
📄 Setup.gs
📄 Login.html
📄 App.html
📄 StyleCSS.html
📄 JavaScript.html
```

---

## 6. Konfigurasi ID

Ini adalah langkah KRITIS. Anda harus memasukkan ID Spreadsheet dan Folder yang sudah disalin sebelumnya.

### Langkah-langkah:

1. Buka file **`Config`** (Config.gs) di editor GAS
2. Cari baris kode berikut (sekitar baris 13-14):

```javascript
var SPREADSHEET_ID = 'GANTI_DENGAN_ID_SPREADSHEET_ANDA';
var ROOT_FOLDER_ID = 'GANTI_DENGAN_ID_FOLDER_DRIVE_ANDA';
```

3. **Ganti** teks placeholder dengan ID yang sudah Anda simpan:

```javascript
var SPREADSHEET_ID = '1aBcDeFgHiJkLmNoPqRsTuVwXyZ';    // ← ID Spreadsheet Anda
var ROOT_FOLDER_ID = '1xYzAbCdEfGhIjKlMnOpQrS';        // ← ID Folder Drive Anda
```

4. Tekan **Ctrl+S** untuk menyimpan

> [!CAUTION]
> Pastikan ID diapit oleh tanda petik satu (`'...'`). Jangan ada spasi tambahan. Jika ID salah, sistem tidak akan berfungsi.

---

## 7. Menjalankan Setup Awal

Fungsi setup akan otomatis membuat struktur database dan folder penyimpanan.

### Langkah-langkah:

1. Buka file **`Setup`** (Setup.gs) di editor
2. Di toolbar atas, ada dropdown fungsi — pilih **`initializeApp`**
3. Klik tombol **▶️ Run** (Jalankan)

4. **Izin Akses (Pertama Kali):**
   - Muncul popup `Authorization required` → klik **`Review permissions`**
   - Pilih **akun Google** Anda
   - Mungkin muncul peringatan `Google hasn't verified this app` → klik **`Advanced`** → **`Go to SIPAMANDAQ (unsafe)`**
   - Klik **`Allow`** (Izinkan)

5. **Tunggu Eksekusi:**
   - Proses berjalan selama ±10-30 detik
   - Lihat panel **Execution log** di bagian bawah

6. **Hasil yang Diharapkan (di Execution log):**
```
=== Memulai Setup SIPAMANDAQ ===
Sheet "Users" berhasil dibuat.
Sheet "Dokumen_Prodi" berhasil dibuat.
Sheet "Dokumen_Dosen" berhasil dibuat.
Sheet "Dokumen_Tendik" berhasil dibuat.
Sheet "Dokumen_Mahasiswa" berhasil dibuat.
Sheet "Sheet1" default dihapus.
Folder "Dokumen_Prodi" siap.
Folder "Dokumen_Dosen" siap.
Folder "Dokumen_Tendik" siap.
Folder "Dokumen_Mahasiswa" siap.
4 user default berhasil ditambahkan.
=== Setup SIPAMANDAQ Selesai! ===
```

### Verifikasi Setup:

- ✅ Buka Spreadsheet `SIPAMANDAQ_DB` → harus ada **5 sheet** (tab) baru: `Users`, `Dokumen_Prodi`, `Dokumen_Dosen`, `Dokumen_Tendik`, `Dokumen_Mahasiswa`
- ✅ Buka sheet `Users` → harus ada **4 baris data** user default
- ✅ Buka folder `SIPAMANDAQ_FILES` di Drive → harus ada **4 subfolder**

> [!WARNING]
> Jika muncul error, kemungkinan besar ID Spreadsheet atau Folder yang dimasukkan salah. Cek kembali Langkah 6.

---

## 8. Deploy sebagai Web App

Setelah setup berhasil, saatnya mempublikasikan aplikasi agar bisa diakses via browser.

### Langkah-langkah:

1. Di editor GAS, klik menu **`Deploy`** (pojok kanan atas)
2. Pilih **`New deployment`** (Deploy baru)

3. Di dialog yang muncul:
   - Klik ikon **⚙️ gear** di sebelah `Select type`
   - Pilih **`Web app`**

4. **Isi konfigurasi:**

| Pengaturan | Nilai |
|------------|-------|
| **Description** | `SIPAMANDAQ v1.0` |
| **Execute as** | `Me` (Saya / akun Anda) |
| **Who has access** | `Anyone` (Siapa saja) |

5. Klik tombol **`Deploy`**

6. **Salin URL Web App:**
   - Setelah proses deploy selesai, akan muncul URL seperti:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
   - Klik tombol **`Copy`** untuk menyalin URL
   - **Simpan URL ini!** Ini adalah alamat aplikasi SIPAMANDAQ Anda

7. Klik **`Done`** (Selesai)

> [!NOTE]
> URL ini bisa dibagikan ke semua pengguna (dosen, tendik) yang perlu mengakses sistem. Mereka cukup membuka URL tersebut di browser.

---

## 9. Pengujian Aplikasi

Buka URL Web App yang sudah disalin di browser. Halaman login akan muncul.

### 9.1 — Test Login Admin

| Field | Isi |
|-------|-----|
| Username | `admin` |
| Password | `admin123` |

**Yang harus terlihat setelah login:**
- ✅ Dashboard dengan statistik (semua menunjukkan 0 karena belum ada dokumen)
- ✅ Sidebar menampilkan **SEMUA menu**: Dokumen Prodi, Dosen, Tendik, Mahasiswa
- ✅ Menu Pengaturan Akun memiliki tab **Manajemen User**

### 9.2 — Test Login Dosen

| Field | Isi |
|-------|-----|
| Username | `198501012020` |
| Password | `dosen123` |

**Yang harus terlihat:**
- ✅ Sidebar **hanya** menampilkan: Dokumen Prodi dan Dokumen Dosen
- ✅ Dokumen Prodi → **tidak ada tombol Upload** (view only)
- ✅ Dokumen Dosen → **ada tombol Upload** (CRUD sendiri)

### 9.3 — Test Login Tendik

| Field | Isi |
|-------|-----|
| Username | `siti_tendik` |
| Password | `tendik123` |

**Yang harus terlihat:**
- ✅ Sidebar menampilkan: Dokumen Prodi, Dosen, Tendik, Mahasiswa
- ✅ Dokumen Dosen → **tidak ada tombol Upload** (view only)
- ✅ Dokumen Tendik & Mahasiswa → **ada tombol Upload**

### 9.4 — Test Upload Dokumen

1. Login sebagai **Admin**
2. Klik menu **Dokumen Prodi**
3. Klik tombol **`Upload Arsip Baru`**
4. Isi:
   - Nama Dokumen: `Test Upload Kurikulum`
   - Kategori: `Kurikulum`
   - File: pilih file PDF/gambar (maks 10MB)
5. Klik **Upload**
6. ✅ Dokumen muncul di tabel
7. ✅ File tersimpan di Google Drive → folder `SIPAMANDAQ_FILES/Dokumen_Prodi/`

---

## 10. Troubleshooting

### ❌ Error: `Script function not found: doGet`
**Solusi:** Pastikan file `Code.gs` berisi fungsi `doGet(e)`. Cek ulang apakah kode sudah disalin dengan benar.

### ❌ Error: `SpreadsheetApp.openById` / `DriveApp.getFolderById`
**Solusi:** ID Spreadsheet atau Folder yang dimasukkan di `Config.gs` salah atau tidak ada. Cek kembali Langkah 6.

### ❌ Error: `Authorization required`
**Solusi:** Jalankan ulang fungsi `initializeApp` dan berikan izin akses. Pastikan klik `Advanced > Go to SIPAMANDAQ (unsafe) > Allow`.

### ❌ Halaman login muncul kosong / error saat load
**Solusi:** 
1. Pastikan file `Login.html` sudah ada di project GAS
2. Pastikan nama file PERSIS (`Login`, bukan `login` atau `LOGIN`)

### ❌ Setelah login, halaman kosong (tidak masuk ke dashboard)
**Solusi:** 
1. Buka **Chrome DevTools** (F12) → tab Console
2. Lihat error yang muncul
3. Kemungkinan besar file `App.html`, `StyleCSS.html`, atau `JavaScript.html` belum disalin dengan benar

### ❌ Upload file gagal / timeout
**Solusi:**
1. Pastikan ukuran file ≤ 10MB
2. Google Apps Script memiliki batas 6 menit per eksekusi — file yang sangat besar bisa timeout
3. Gunakan file PDF/gambar berukuran kecil untuk tes awal

### ❌ Session tiba-tiba expired
**Solusi:** Session menggunakan `CacheService` yang berlaku 8 jam. Setelah 8 jam, user perlu login ulang. Ini normal.

---

## 11. Update & Maintenance

### Cara Update Kode
Jika ada perubahan pada kode setelah deploy:

1. Edit kode di editor GAS
2. Klik **`Deploy`** → **`Manage deployments`**
3. Klik ikon **✏️ (edit)** pada deployment yang ada
4. Ubah **Version** dropdown menjadi **`New version`**
5. Klik **`Deploy`**
6. URL tetap sama, tidak berubah

### Cara Menambah User Manual (via Spreadsheet)
Jika ingin menambah user langsung dari Spreadsheet:

1. Buka Spreadsheet `SIPAMANDAQ_DB`
2. Buka sheet **`Users`**
3. Tambahkan baris baru dengan format:

| id | nama | username_nip | password | role | hak_akses | created_at |
|----|------|-------------|----------|------|-----------|------------|
| `usr-xxx` | Nama Lengkap | NIP/Username | password | `admin`/`dosen`/`tendik` | `default`/`semua` | 28-04-2026 |

### Cara Backup Data
1. Buka Spreadsheet → **File** → **Download** → **Microsoft Excel (.xlsx)**
2. Buka Google Drive folder `SIPAMANDAQ_FILES` → Klik kanan → **Download**

### Cara Menambah Kategori Baru
1. Buka file `Config.gs` di editor GAS
2. Cari bagian `KATEGORI_MAP`
3. Tambahkan item baru di array yang sesuai
4. Simpan dan re-deploy (Langkah 11 - Update)

---

## 📎 Lampiran — Akun Default

| No | Nama | Role | Username | Password |
|----|------|------|----------|----------|
| 1 | M. Sabil, S.Kom | **Admin** | `admin` | `admin123` |
| 2 | Ahmad Dosen, M.Kom | Dosen | `198501012020` | `dosen123` |
| 3 | Budi Raharjo, S.Pd, M.T | Dosen | `199003152021` | `dosen456` |
| 4 | Siti Tendik, A.Md | Tendik | `siti_tendik` | `tendik123` |

> [!CAUTION]
> **SEGERA GANTI PASSWORD DEFAULT** setelah berhasil deploy! Terutama akun Admin.  
> Buka menu **Pengaturan Akun** → tab **Manajemen User** → edit password masing-masing user.

---

## 📎 Lampiran — Hak Akses Menu per Role

| Menu | Admin | Dosen | Tendik |
|------|:-----:|:-----:|:------:|
| Dashboard | ✅ Statistik semua | ✅ Statistik sendiri | ✅ Statistik sendiri |
| Dokumen Prodi | ✅ Full CRUD | 👁 Lihat saja | ✅ Full CRUD |
| Dokumen Dosen | ✅ Full CRUD + lihat semua | ✅ CRUD dok sendiri | 👁 Lihat saja |
| Dokumen Tendik | ✅ Full CRUD + lihat semua | ❌ Tidak terlihat | ✅ CRUD dok sendiri |
| Dokumen Mahasiswa | ✅ Full CRUD + lihat semua | ❌ Tidak terlihat | ✅ CRUD dok sendiri |
| Pengaturan - Profil | ✅ Edit sendiri | ✅ Edit sendiri | ✅ Edit sendiri |
| Pengaturan - User Mgmt | ✅ CRUD semua user | ❌ Tidak terlihat | ❌ Tidak terlihat |

---

> **Dibuat untuk:** Program Studi Pendidikan Teknologi Informasi  
> **Versi:** 1.0  
> **Tanggal:** April 2026
