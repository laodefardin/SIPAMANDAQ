/**
 * ============================================================
 * Setup.gs — Script Setup Awal SIPAMANDAQ
 * ============================================================
 * JALANKAN FUNGSI initializeApp() SATU KALI saja
 * setelah mengisi SPREADSHEET_ID dan ROOT_FOLDER_ID di Config.gs
 */

/**
 * initializeApp() — Setup awal: buat sheets dan folder structure.
 * Jalankan manual dari Apps Script editor.
 */
function initializeApp() {
  Logger.log('=== Memulai Setup SIPAMANDAQ ===');
  
  // 1. Setup Sheets
  setupSheets_();
  
  // 2. Setup Drive Folders
  setupDriveFolders_();
  
  // 3. Insert data user default
  insertDefaultUsers_();
  
  Logger.log('=== Setup SIPAMANDAQ Selesai! ===');
  Logger.log('Sekarang deploy sebagai Web App:');
  Logger.log('Deploy > New Deployment > Web App');
  Logger.log('Execute as: Me');
  Logger.log('Who has access: Anyone');
}

/**
 * setupSheets_() — Buat semua sheet yang diperlukan.
 */
function setupSheets_() {
  var ss = getSpreadsheet_();
  
  // Sheet Users
  var sheetUsers = ss.getSheetByName(SHEET_USERS);
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet(SHEET_USERS);
    sheetUsers.appendRow(['id', 'nama', 'username_nip', 'password', 'role', 'hak_akses', 'created_at', 'foto_profil']);
    Logger.log('Sheet "Users" berhasil dibuat.');
  } else {
    Logger.log('Sheet "Users" sudah ada.');
  }
  
  // Sheet Dokumen (4 sheet dengan struktur sama)
  var docSheets = [SHEET_DOKUMEN_PRODI, SHEET_DOKUMEN_DOSEN, SHEET_DOKUMEN_TENDIK, SHEET_DOKUMEN_MHS];
  var docHeaders = ['id', 'tgl_upload', 'nama_dok', 'jenis_file', 'kategori', 'uploader_id', 'uploader_nama', 'file_url', 'gdrive_file_id'];
  
  for (var i = 0; i < docSheets.length; i++) {
    var sheet = ss.getSheetByName(docSheets[i]);
    if (!sheet) {
      sheet = ss.insertSheet(docSheets[i]);
      sheet.appendRow(docHeaders);
      Logger.log('Sheet "' + docSheets[i] + '" berhasil dibuat.');
    } else {
      Logger.log('Sheet "' + docSheets[i] + '" sudah ada.');
    }
  }
  
  // Sheet Kategori_App
  var sheetKategori = ss.getSheetByName('Kategori_App');
  if(!sheetKategori) {
    sheetKategori = ss.insertSheet('Kategori_App');
    sheetKategori.appendRow(['tipe_dokumen', 'nama_kategori']);
    Logger.log('Sheet "Kategori_App" berhasil dibuat.');
  }
  
  // Migrasi kategori dari KATEGORI_MAP jika sheet masih kosong (hanya header)
  var katData = sheetKategori.getDataRange().getValues();
  if (katData.length <= 1) {
    Logger.log('Memulai migrasi kategori dari KATEGORI_MAP...');
    for (var tipe in KATEGORI_MAP) {
      var items = KATEGORI_MAP[tipe];
      for (var k = 0; k < items.length; k++) {
        sheetKategori.appendRow([tipe, items[k]]);
      }
    }
    Logger.log('Migrasi ' + sheetKategori.getLastRow() + ' kategori selesai.');
  } else {
    Logger.log('Sheet "Kategori_App" sudah berisi data, skip migrasi.');
  }
  
  // Hapus Sheet1 default jika ada
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
    Logger.log('Sheet "Sheet1" default dihapus.');
  }
}

/**
 * setupDriveFolders_() — Buat struktur folder di Google Drive.
 */
function setupDriveFolders_() {
  var rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
  
  var folders = [FOLDER_PRODI, FOLDER_DOSEN, FOLDER_TENDIK, FOLDER_MHS];
  
  for (var i = 0; i < folders.length; i++) {
    getOrCreateFolder_(rootFolder, folders[i]);
    Logger.log('Folder "' + folders[i] + '" siap.');
  }
}

/**
 * insertDefaultUsers_() — Insert user default jika sheet kosong.
 */
function insertDefaultUsers_() {
  var sheet = getSheet_(SHEET_USERS);
  var data = sheet.getDataRange().getValues();
  
  // Hanya insert jika belum ada data (selain header)
  if (data.length > 1) {
    Logger.log('Data user sudah ada, skip insert default.');
    return;
  }
  
  var now = formatDate_(new Date());
  
  var defaultUsers = [
    ['usr-001', '⁠Cita St. Munthakhabah R, S.Pd.,M.Pd',           'admin',        'admin123',   'admin',  'semua',   now],
    ['usr-002', 'Laode Muh Zulfardin Syah, S.Pd., M.Pd',         '199607142025061003', 'dosen123',   'dosen',  'default', now],
    ['usr-003', 'Riawati S.I.Pust',          'tendik',  'tendik123',  'tendik', 'default', now],
    ['usr-004', '⁠Anwar Wahid, S.Pd., M.Pd',   '199205242025061006', 'dosen456',   'dosen',  'semua',   now]
  ];
  
  for (var i = 0; i < defaultUsers.length; i++) {
    sheet.appendRow(defaultUsers[i]);
  }
  
  Logger.log(defaultUsers.length + ' user default berhasil ditambahkan.');
}
