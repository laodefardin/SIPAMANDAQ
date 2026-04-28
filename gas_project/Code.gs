/**
 * ============================================================
 * Code.gs — Entry Point & Routing SIPAMANDAQ
 * ============================================================
 */

/**
 * doGet() — Entry point Web App.
 * Menentukan halaman yang ditampilkan berdasarkan session.
 */
function doGet(e) {
  var session = getSession_();
  var settings = getAppSettings_();
  
  if (!session) {
    // Belum login — tampilkan halaman login
    var template = HtmlService.createTemplateFromFile('Login');
    template.settings = settings;
    return template
      .evaluate()
      .setTitle('Login - ' + settings.title)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  // Sudah login — tampilkan aplikasi utama
  var template = HtmlService.createTemplateFromFile('App');
  template.session = session;
  template.settings = settings;
  
  return template
    .evaluate()
    .setTitle(settings.title + ' - Sistem Manajemen Arsip Dokumen')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * include() — Helper untuk menyertakan file HTML partial.
 * Digunakan di template: <?!= include('StyleCSS') ?>
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * getAppSettings_() — Mengambil pengaturan sistem dari ScriptProperties
 */
function getAppSettings_() {
  var props = PropertiesService.getScriptProperties();
  return {
    title: props.getProperty('app_title') || 'SIPAMANDAQ',
    prodi: props.getProperty('app_prodi') || 'Pendidikan Teknologi Informasi',
    desc: props.getProperty('app_desc') || 'Kelola dan pantau seluruh arsip dokumen Program Studi Pendidikan Teknologi Informasi dari satu tempat yang terintegrasi.'
  };
}

/**
 * getSpreadsheet_() — Helper untuk mendapatkan Spreadsheet.
 */
function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * getSheet_() — Helper untuk mendapatkan Sheet tertentu.
 */
function getSheet_(sheetName) {
  var ss = getSpreadsheet_();
  return ss.getSheetByName(sheetName);
}

/**
 * generateId_() — Generate unique ID sederhana.
 */
function generateId_() {
  return Utilities.getUuid().substring(0, 8);
}

/**
 * formatDate_() — Format tanggal ke DD-MM-YYYY.
 */
function formatDate_(date) {
  var d = date || new Date();
  var dd = ('0' + d.getDate()).slice(-2);
  var mm = ('0' + (d.getMonth() + 1)).slice(-2);
  var yyyy = d.getFullYear();
  return dd + '-' + mm + '-' + yyyy;
}

/**
 * getKategoriList() — Mendapatkan daftar kategori berdasarkan sheet.
 * Dipanggil dari client-side.
 */
function getKategoriList(sheetName) {
  return KATEGORI_MAP[sheetName] || [];
}

/**
 * getRoleAccess() — Mendapatkan konfigurasi akses untuk role tertentu.
 * Dipanggil dari client-side.
 */
function getRoleAccess(token) {
  var session = validateSession_(token);
  if (!session) return null;
  
  var access = ROLE_ACCESS[session.role];
  return {
    role: session.role,
    menu: access.menu,
    crud: access.crud,
    viewOnly: access.viewOnly || [],
    viewAll: access.viewAll,
    userManagement: access.userManagement
  };
}

/**
 * getWebAppUrl() — Mengembalikan URL Web App yang sudah di-deploy.
 * Digunakan untuk redirect setelah login.
 */
function getWebAppUrl() {
  return ScriptApp.getService().getUrl();
}
