/**
 * ============================================================
 * UserManager.gs — Manajemen User (Admin Only)
 * ============================================================
 */

/**
 * getUsers() — Ambil daftar semua user.
 * @param {string} token
 * @returns {Object} {success, data}
 */
function getUsers(token) {
  try {
    var session = requireAdmin_(token);
    
    var sheet = getSheet_(SHEET_USERS);
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var users = [];
    
    for (var i = 1; i < data.length; i++) {
      var user = {};
      for (var j = 0; j < headers.length; j++) {
        // Jangan kirim password ke client
        if (headers[j] === 'password') {
          user[headers[j]] = '••••••';
        } else {
          user[headers[j]] = data[i][j];
        }
      }
      user._rowIndex = i + 1;
      users.push(user);
    }
    
    return { success: true, data: users, currentUserId: session.id };
    
  } catch (e) {
    if (e.message === 'ACCESS_DENIED') return { success: false, message: 'Akses ditolak. Hanya admin.' };
    if (e.message === 'SESSION_EXPIRED') return { success: false, message: 'SESSION_EXPIRED' };
    return { success: false, message: 'Gagal memuat user: ' + e.message };
  }
}

/**
 * addUser() — Tambah user baru (admin only).
 * @param {string} token
 * @param {Object} userData - {nama, username_nip, password, role, hak_akses}
 * @returns {Object} {success, message}
 */
function addUser(token, userData) {
  try {
    requireAdmin_(token);
    
    // Validasi
    if (!userData.nama || !userData.username_nip || !userData.password || !userData.role) {
      return { success: false, message: 'Semua field wajib diisi.' };
    }
    
    // Cek duplikat username
    var sheet = getSheet_(SHEET_USERS);
    var data = sheet.getDataRange().getValues();
    var colUsername = data[0].indexOf('username_nip');
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][colUsername]).trim() === String(userData.username_nip).trim()) {
        return { success: false, message: 'Username/NIP "' + userData.username_nip + '" sudah terdaftar.' };
      }
    }
    
    // Tambahkan user baru
    var id = generateId_();
    var now = formatDate_(new Date());
    
    sheet.appendRow([
      id,
      userData.nama,
      userData.username_nip,
      userData.password,
      userData.role.toLowerCase(),
      userData.hak_akses || 'default',
      now
    ]);
    
    return { success: true, message: 'User "' + userData.nama + '" berhasil ditambahkan!' };
    
  } catch (e) {
    if (e.message === 'ACCESS_DENIED') return { success: false, message: 'Akses ditolak.' };
    if (e.message === 'SESSION_EXPIRED') return { success: false, message: 'SESSION_EXPIRED' };
    return { success: false, message: 'Gagal menambahkan user: ' + e.message };
  }
}

/**
 * editUser() — Edit data user.
 * Admin bisa edit semua user, user biasa hanya bisa edit diri sendiri.
 * @param {string} token
 * @param {Object} userData - {rowIndex, nama, username_nip, password, role, hak_akses}
 * @returns {Object} {success, message}
 */
function editUser(token, userData) {
  try {
    var session = requireAuth_(token);
    var sheet = getSheet_(SHEET_USERS);
    var rowIndex = userData.rowIndex;
    var rowData = sheet.getRange(rowIndex, 1, 1, 7).getValues()[0];
    
    // Non-admin hanya bisa edit diri sendiri
    if (session.role !== 'admin' && String(rowData[0]) !== String(session.id)) {
      return { success: false, message: 'Anda hanya dapat mengedit akun Anda sendiri.' };
    }
    
    // Update data
    sheet.getRange(rowIndex, 2).setValue(userData.nama);         // nama
    sheet.getRange(rowIndex, 3).setValue(userData.username_nip); // username
    
    // Password: hanya update jika diisi (tidak kosong)
    if (userData.password && userData.password !== '' && userData.password !== '••••••') {
      sheet.getRange(rowIndex, 4).setValue(userData.password);
    }
    
    // Role & hak_akses hanya bisa diubah oleh admin
    if (session.role === 'admin') {
      if (userData.role) {
        sheet.getRange(rowIndex, 5).setValue(userData.role.toLowerCase());
      }
      if (userData.hak_akses) {
        sheet.getRange(rowIndex, 6).setValue(userData.hak_akses);
      }
    }
    
    // Update session jika user mengedit dirinya sendiri
    if (String(rowData[0]) === String(session.id)) {
      var cache = CacheService.getScriptCache();
      var props = PropertiesService.getUserProperties();
      var storedToken = props.getProperty('session_token');
      
      if (storedToken) {
        session.nama = userData.nama;
        session.username = userData.username_nip;
        cache.put('session_' + storedToken, JSON.stringify(session), SESSION_DURATION);
        props.setProperty('current_session', JSON.stringify(session));
      }
    }
    
    return { success: true, message: 'Data user berhasil diperbarui!' };
    
  } catch (e) {
    if (e.message === 'SESSION_EXPIRED') return { success: false, message: 'SESSION_EXPIRED' };
    return { success: false, message: 'Gagal mengedit user: ' + e.message };
  }
}

/**
 * deleteUser() — Hapus user (admin only).
 * @param {string} token
 * @param {number} rowIndex - Row index di sheet Users
 * @returns {Object} {success, message}
 */
function deleteUser(token, rowIndex) {
  try {
    var session = requireAdmin_(token);
    
    var sheet = getSheet_(SHEET_USERS);
    var rowData = sheet.getRange(rowIndex, 1, 1, 7).getValues()[0];
    
    // Tidak bisa menghapus diri sendiri
    if (String(rowData[0]) === String(session.id)) {
      return { success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri.' };
    }
    
    var userName = rowData[1];
    sheet.deleteRow(rowIndex);
    
    return { success: true, message: 'User "' + userName + '" berhasil dihapus.' };
    
  } catch (e) {
    if (e.message === 'ACCESS_DENIED') return { success: false, message: 'Akses ditolak.' };
    if (e.message === 'SESSION_EXPIRED') return { success: false, message: 'SESSION_EXPIRED' };
    return { success: false, message: 'Gagal menghapus user: ' + e.message };
  }
}

/**
 * updateProfile() — User mengedit profil sendiri (tanpa perlu admin).
 * @param {string} token
 * @param {Object} profileData - {nama, username_nip, password}
 * @returns {Object} {success, message}
 */
function updateProfile(token, profileData) {
  try {
    var session = requireAuth_(token);
    
    // Cari row user berdasarkan session id
    var sheet = getSheet_(SHEET_USERS);
    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(session.id)) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, message: 'Data user tidak ditemukan.' };
    }
    
    return editUser(token, {
      rowIndex: rowIndex,
      nama: profileData.nama,
      username_nip: profileData.username_nip,
      password: profileData.password || ''
    });
    
  } catch (e) {
    if (e.message === 'SESSION_EXPIRED') return { success: false, message: 'SESSION_EXPIRED' };
    return { success: false, message: 'Gagal memperbarui profil: ' + e.message };
  }
}
