/**
 * ============================================================
 * Config.gs — Konfigurasi Global SIPAMANDAQ
 * ============================================================
 * PENTING: Ganti nilai SPREADSHEET_ID dan ROOT_FOLDER_ID
 * dengan ID milik Anda sebelum menjalankan Setup.
 */

// === ID Google Spreadsheet (Database) ===
// Buat Spreadsheet baru di Google Sheets, lalu salin ID-nya dari URL:
// https://docs.google.com/spreadsheets/d/[INI_ID_NYA]/edit
var SPREADSHEET_ID = 'GANTI_DENGAN_ID_SPREADSHEET_ANDA';

// === ID Folder Root di Google Drive (File Storage) ===
// Buat folder baru di Google Drive, lalu salin ID-nya dari URL:
// https://drive.google.com/drive/folders/[INI_ID_NYA]
var ROOT_FOLDER_ID = 'GANTI_DENGAN_ID_FOLDER_DRIVE_ANDA';

// === Nama-nama Sheet ===
var SHEET_USERS           = 'Users';
var SHEET_DOKUMEN_PRODI   = 'Dokumen_Prodi';
var SHEET_DOKUMEN_DOSEN   = 'Dokumen_Dosen';
var SHEET_DOKUMEN_TENDIK  = 'Dokumen_Tendik';
var SHEET_DOKUMEN_MHS     = 'Dokumen_Mahasiswa';

// === Nama Sub-Folder di Google Drive ===
var FOLDER_PRODI     = 'Dokumen_Prodi';
var FOLDER_DOSEN     = 'Dokumen_Dosen';
var FOLDER_TENDIK    = 'Dokumen_Tendik';
var FOLDER_MHS       = 'Dokumen_Mahasiswa';

// === Session Config ===
var SESSION_DURATION = 28800; // 8 jam dalam detik

// === Mapping Sheet ke Folder ===
var SHEET_TO_FOLDER = {};
SHEET_TO_FOLDER[SHEET_DOKUMEN_PRODI]  = FOLDER_PRODI;
SHEET_TO_FOLDER[SHEET_DOKUMEN_DOSEN]  = FOLDER_DOSEN;
SHEET_TO_FOLDER[SHEET_DOKUMEN_TENDIK] = FOLDER_TENDIK;
SHEET_TO_FOLDER[SHEET_DOKUMEN_MHS]    = FOLDER_MHS;

// === Kategori per halaman dokumen ===
var KATEGORI_MAP = {};
KATEGORI_MAP[SHEET_DOKUMEN_PRODI] = [
  'Kurikulum', 'SK', 'SOP', 'SK Mengajar', 'Rencana Strategis (Renstra)',
  'Rencana Operasional (Renop)', 'Dokumen Akreditasi', 'Panduan Akademik', 'Laporan Kinerja Prodi'
];
KATEGORI_MAP[SHEET_DOKUMEN_DOSEN] = [
  'SK Dosen', 'Surat Tugas', 'Bukti Tridarma', 'Jurnal/Publikasi',
  'Sertifikat Pendidik', 'Ijazah', 'CV', 'Sertifikat Pelatihan/Seminar'
];
KATEGORI_MAP[SHEET_DOKUMEN_TENDIK] = [
  'SK Pengangkatan', 'Surat Tugas', 'Laporan Kinerja Tendik',
  'Sertifikat Pelatihan Kepegawaian', 'Presensi/Absensi', 'Biodata Pekerja'
];
KATEGORI_MAP[SHEET_DOKUMEN_MHS] = [
  'KRS', 'KHS', 'Transkrip Nilai', 'Proposal Skripsi/TA',
  'SK Yudisium', 'SK Lulus', 'Surat Keterangan Aktif', 'Surat Keterangan Cuti'
];

// === Akses Menu per Role ===
// Menentukan sheet mana yang bisa diakses oleh role tertentu
var ROLE_ACCESS = {};
ROLE_ACCESS['admin'] = {
  menu: [SHEET_DOKUMEN_PRODI, SHEET_DOKUMEN_DOSEN, SHEET_DOKUMEN_TENDIK, SHEET_DOKUMEN_MHS],
  crud: [SHEET_DOKUMEN_PRODI, SHEET_DOKUMEN_DOSEN, SHEET_DOKUMEN_TENDIK, SHEET_DOKUMEN_MHS],
  viewAll: true,
  userManagement: true
};
ROLE_ACCESS['dosen'] = {
  menu: [SHEET_DOKUMEN_PRODI, SHEET_DOKUMEN_DOSEN],
  crud: [SHEET_DOKUMEN_DOSEN], // hanya bisa CRUD di Dosen
  viewOnly: [SHEET_DOKUMEN_PRODI], // Prodi hanya view
  viewAll: false,
  userManagement: false
};
ROLE_ACCESS['tendik'] = {
  menu: [SHEET_DOKUMEN_PRODI, SHEET_DOKUMEN_DOSEN, SHEET_DOKUMEN_TENDIK, SHEET_DOKUMEN_MHS],
  crud: [SHEET_DOKUMEN_PRODI, SHEET_DOKUMEN_TENDIK, SHEET_DOKUMEN_MHS],
  viewOnly: [SHEET_DOKUMEN_DOSEN],
  viewAll: false,
  userManagement: false
};
