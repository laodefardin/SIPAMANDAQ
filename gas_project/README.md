# 🗂 SIPAMANDAQ — Panduan Setup Backend (Google Apps Script)

## Prasyarat
- Akun Google (Gmail)
- Akses ke [Google Apps Script](https://script.google.com)

---

## Langkah Setup (10 menit)

### 1️⃣ Buat Google Spreadsheet
1. Buka [Google Sheets](https://sheets.google.com)
2. Klik **+ Blank** (buat spreadsheet baru)
3. Beri nama: `SIPAMANDAQ_DB`
4. **Salin ID Spreadsheet** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[SALIN_ID_INI]/edit
   ```

### 2️⃣ Buat Folder Google Drive
1. Buka [Google Drive](https://drive.google.com)
2. Klik **+ New > Folder**, beri nama: `SIPAMANDAQ_FILES`
3. Buka folder tersebut
4. **Salin ID Folder** dari URL:
   ```
   https://drive.google.com/drive/folders/[SALIN_ID_INI]
   ```

### 3️⃣ Buat Project Google Apps Script
1. Buka [script.google.com](https://script.google.com)
2. Klik **+ New Project**
3. Beri nama project: `SIPAMANDAQ`
4. **Hapus** isi file `Code.gs` yang ada

### 4️⃣ Salin File ke Apps Script
Buat file-file berikut di project GAS (klik **+ > Script** untuk `.gs`, **+ > HTML** untuk `.html`):

#### File `.gs` (Server-side):
| Nama File | Deskripsi |
|-----------|-----------|
| `Config.gs` | Konfigurasi (⚠️ ISI ID DI SINI) |
| `Code.gs` | Entry point & routing |
| `Auth.gs` | Autentikasi & session |
| `Database.gs` | CRUD dokumen |
| `UserManager.gs` | Manajemen user |
| `FileManager.gs` | Manajemen file Drive |
| `Setup.gs` | Script setup awal |

#### File `.html` (Client-side):
| Nama File | Deskripsi |
|-----------|-----------|
| `Login.html` | Halaman login |
| `App.html` | Layout utama (SPA) |
| `StyleCSS.html` | CSS shared |
| `JavaScript.html` | JS shared |

> **Catatan:** Di GAS editor, saat membuat HTML file, jangan tambahkan `.html` di nama — GAS otomatis menambahkannya.

### 5️⃣ Konfigurasi ID
Buka `Config.gs` dan ganti 2 nilai ini:
```javascript
var SPREADSHEET_ID = 'PASTE_ID_SPREADSHEET_ANDA';
var ROOT_FOLDER_ID = 'PASTE_ID_FOLDER_DRIVE_ANDA';
```

### 6️⃣ Jalankan Setup Awal
1. Buka file `Setup.gs`
2. Pilih fungsi `initializeApp` dari dropdown atas
3. Klik ▶️ **Run**
4. Jika diminta permission, klik **Review Permissions** > pilih akun Google > **Allow**
5. Cek **Execution Log** — seharusnya menampilkan pesan sukses

Ini akan otomatis:
- Membuat 5 sheet (Users, Dokumen_Prodi, dll.)
- Membuat 4 folder di Google Drive
- Menambahkan 4 user default

### 7️⃣ Deploy sebagai Web App
1. Klik **Deploy > New Deployment**
2. Klik ⚙️ (gear icon) > pilih **Web App**
3. Konfigurasi:
   - **Description:** `SIPAMANDAQ v1.0`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. Klik **Deploy**
5. **Salin URL Web App** yang diberikan — ini adalah link aplikasi Anda!

---

## 🔑 Akun Default

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Dosen | `198501012020` | `dosen123` |
| Dosen | `199003152021` | `dosen456` |
| Tendik | `siti_tendik` | `tendik123` |

---

## 🔄 Update Deployment
Jika Anda mengubah kode setelah deploy:
1. Klik **Deploy > Manage deployments**
2. Klik ✏️ (edit) pada deployment yang ada
3. Ubah **Version** menjadi **New version**
4. Klik **Deploy**

---

## 📂 Struktur Folder Google Drive (Otomatis)
```
📁 SIPAMANDAQ_FILES (root)
 ├── 📁 Dokumen_Prodi
 ├── 📁 Dokumen_Dosen
 │    ├── 📁 198501012020_Ahmad Dosen, M.Kom
 │    └── 📁 199003152021_Budi Raharjo, S.Pd, M.T
 ├── 📁 Dokumen_Tendik
 │    └── 📁 siti_tendik_Siti Tendik, A.Md
 └── 📁 Dokumen_Mahasiswa
```

Subfolder per-user dibuat otomatis saat user pertama kali upload file.
