/**
 * ============================================================
 * Auth.gs — Autentikasi & Session Management
 * ============================================================
 * Menggunakan CacheService untuk menyimpan session token.
 */

/**
 * login() — Validasi kredensial login.
 * @param {string} username - NIP/NUPTK/Username
 * @param {string} password - Password
 * @returns {Object} {success, token, user, message}
 */
function login(username, password) {
  try {
    if (!username || !password) {
      return { success: false, message: 'Username dan password wajib diisi.' };
    }
    
    var sheet = getSheet_(SHEET_USERS);
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var colUsername = headers.indexOf('username_nip');
    var colPassword = headers.indexOf('password');
    var colId       = headers.indexOf('id');
    var colNama     = headers.indexOf('nama');
    var colRole     = headers.indexOf('role');
    var colAccess   = headers.indexOf('hak_akses');
    var colFoto     = headers.indexOf('foto_profil');
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (String(row[colUsername]).trim() === String(username).trim() && 
          String(row[colPassword]).trim() === String(password).trim()) {
        
        var userData = {
          id: row[colId],
          nama: row[colNama],
          username: row[colUsername],
          role: row[colRole],
          hak_akses: row[colAccess],
          foto_profil: colFoto !== -1 ? row[colFoto] : '',
          rowIndex: i + 1
        };
        
        // Generate session token dan simpan di cache
        var token = Utilities.getUuid();
        var cache = CacheService.getScriptCache();
        cache.put('session_' + token, JSON.stringify(userData), SESSION_DURATION);
        
        // Langsung set server session (untuk doGet routing)
        var props = PropertiesService.getUserProperties();
        props.setProperty('current_session', JSON.stringify(userData));
        props.setProperty('session_token', token);
        
        // Ambil URL web app untuk redirect
        var webAppUrl = ScriptApp.getService().getUrl();
        
        return {
          success: true,
          token: token,
          user: userData,
          redirectUrl: webAppUrl,
          message: 'Login berhasil! Selamat datang, ' + row[colNama]
        };
      }
    }
    
    return { success: false, message: 'Username atau password salah.' };
    
  } catch (e) {
    return { success: false, message: 'Terjadi kesalahan sistem: ' + e.message };
  }
}

/**
 * logout() — Menghapus session token.
 * @param {string} token - Session token
 * @returns {Object} {success}
 */
function logout(token) {
  try {
    var cache = CacheService.getScriptCache();
    cache.remove('session_' + token);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * validateSession_() — Validasi token session (internal).
 * @param {string} token - Session token
 * @returns {Object|null} User data atau null
 */
function validateSession_(token) {
  if (!token) return null;
  
  try {
    var cache = CacheService.getScriptCache();
    var sessionData = cache.get('session_' + token);
    if (!sessionData) return null;
    return JSON.parse(sessionData);
  } catch (e) {
    return null;
  }
}

/**
 * getSession_() — Mengambil session dari PropertiesService (untuk doGet saja).
 * Fallback function untuk server-side rendering.
 */
function getSession_() {
  var props = PropertiesService.getUserProperties();
  var sessionData = props.getProperty('current_session');
  var token = props.getProperty('session_token');
  if (!sessionData) return null;
  
  try {
    var session = JSON.parse(sessionData);
    session._token = token; // sertakan token untuk client
    return session;
  } catch (e) {
    return null;
  }
}

/**
 * setServerSession() — Simpan session di server properties (dipanggil setelah login sukses).
 * @param {string} token - Session token
 */
function setServerSession(token) {
  var session = validateSession_(token);
  if (session) {
    var props = PropertiesService.getUserProperties();
    props.setProperty('current_session', JSON.stringify(session));
    props.setProperty('session_token', token);
  }
  return session;
}

/**
 * clearServerSession() — Hapus session dari server properties.
 */
function clearServerSession() {
  var props = PropertiesService.getUserProperties();
  var token = props.getProperty('session_token');
  if (token) {
    logout(token);
  }
  props.deleteProperty('current_session');
  props.deleteProperty('session_token');
  return { success: true };
}

/**
 * checkSession() — Cek apakah session masih valid (dipanggil dari client).
 * @param {string} token
 * @returns {Object|null} User data
 */
function checkSession(token) {
  return validateSession_(token);
}

/**
 * requireAuth_() — Middleware: pastikan user sudah login.
 * @param {string} token
 * @returns {Object} User data
 * @throws {Error} jika belum login
 */
function requireAuth_(token) {
  var session = validateSession_(token);
  if (!session) {
    throw new Error('SESSION_EXPIRED');
  }
  return session;
}

/**
 * requireAdmin_() — Middleware: pastikan user adalah admin.
 * @param {string} token
 * @returns {Object} User data
 * @throws {Error} jika bukan admin
 */
function requireAdmin_(token) {
  var session = requireAuth_(token);
  if (session.role !== 'admin') {
    throw new Error('ACCESS_DENIED');
  }
  return session;
}
