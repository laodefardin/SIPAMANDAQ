/**
 * ============================================================
 * Database.gs — CRUD Operations untuk Dokumen
 * ============================================================
 */

/**
 * getDocuments() — Ambil daftar dokumen dari sheet tertentu.
 * Admin: lihat semua. Dosen/Tendik: filter milik sendiri atau semua (tergantung sheet).
 * @param {string} token - Session token
 * @param {string} sheetName - Nama sheet target
 * @returns {Object} {success, data, canCrud, isViewOnly}
 */
function getDocuments(token, sheetName) {
  try {
    var session = requireAuth_(token);
    var access = ROLE_ACCESS[session.role];
    
    // Cek apakah role punya akses ke menu ini
    if (access.menu.indexOf(sheetName) === -1) {
      return { success: false, message: 'Anda tidak memiliki akses ke menu ini.' };
    }
    
    var sheet = getSheet_(sheetName);
    if (!sheet) return { success: false, message: 'Sheet tidak ditemukan.' };
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { 
        success: true, 
        data: [], 
        canCrud: access.crud.indexOf(sheetName) !== -1,
        isViewOnly: (access.viewOnly || []).indexOf(sheetName) !== -1
      };
    }
    
    var headers = data[0];
    var documents = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var doc = {};
      for (var j = 0; j < headers.length; j++) {
        var val = row[j];
        if (val instanceof Date) {
          val = formatDate_(val);
        }
        doc[headers[j]] = val;
      }
      doc._rowIndex = i + 1; // untuk edit/delete
      
      // Filter berdasarkan role
      if (access.viewAll) {
        // Admin: lihat semua
        documents.push(doc);
      } else if ((access.viewOnly || []).indexOf(sheetName) !== -1) {
        // View only: lihat semua dokumen tapi tidak bisa CRUD
        documents.push(doc);
      } else {
        // Non-admin: hanya lihat dokumen milik sendiri
        if (String(doc.uploader_id) === String(session.id)) {
          documents.push(doc);
        }
      }
    }
    
    // Sort by tanggal terbaru
    documents.sort(function(a, b) {
      return new Date(b.tgl_upload) - new Date(a.tgl_upload);
    });
    
    return {
      success: true,
      data: documents,
      canCrud: access.crud.indexOf(sheetName) !== -1,
      isViewOnly: (access.viewOnly || []).indexOf(sheetName) !== -1,
      isAdmin: session.role === 'admin'
    };
    
  } catch (e) {
    if (e.message === 'SESSION_EXPIRED') {
      return { success: false, message: 'SESSION_EXPIRED' };
    }
    return { success: false, message: 'Gagal memuat dokumen: ' + e.message };
  }
}

/**
 * addDocument() — Tambah dokumen baru.
 * @param {string} token
 * @param {string} sheetName - Sheet target
 * @param {Object} docData - {nama_dok, kategori, fileBase64, fileName, mimeType}
 * @returns {Object} {success, message}
 */
function addDocument(token, sheetName, docData) {
  try {
    var session = requireAuth_(token);
    var access = ROLE_ACCESS[session.role];
    
    // Cek hak CRUD
    if (access.crud.indexOf(sheetName) === -1) {
      return { success: false, message: 'Anda tidak memiliki izin untuk mengunggah di area ini.' };
    }
    
    // Upload file ke Google Drive
    var fileResult = uploadFileToDrive_(
      docData.fileBase64,
      docData.fileName,
      docData.mimeType,
      sheetName,
      session
    );
    
    if (!fileResult.success) {
      return { success: false, message: 'Gagal mengupload file: ' + fileResult.message };
    }
    
    // Simpan metadata ke Sheet
    var sheet = getSheet_(sheetName);
    var id = generateId_();
    var now = formatDate_(new Date());
    var ext = docData.fileName.split('.').pop().toUpperCase();
    
    sheet.appendRow([
      id,
      now,
      docData.nama_dok,
      ext,
      docData.kategori,
      session.id,
      session.nama,
      fileResult.fileUrl,
      fileResult.fileId
    ]);
    
    return { success: true, message: 'Dokumen "' + docData.nama_dok + '" berhasil diunggah!' };
    
  } catch (e) {
    if (e.message === 'SESSION_EXPIRED') return { success: false, message: 'SESSION_EXPIRED' };
    return { success: false, message: 'Gagal menambahkan dokumen: ' + e.message };
  }
}

/**
 * editDocument() — Edit metadata dokumen.
 * @param {string} token
 * @param {string} sheetName
 * @param {Object} docData - {rowIndex, nama_dok, kategori, fileBase64?, fileName?, mimeType?}
 * @returns {Object} {success, message}
 */
function editDocument(token, sheetName, docData) {
  try {
    var session = requireAuth_(token);
    var access = ROLE_ACCESS[session.role];
    
    // Cek hak CRUD
    if (access.crud.indexOf(sheetName) === -1) {
      return { success: false, message: 'Anda tidak memiliki izin untuk mengedit.' };
    }
    
    var sheet = getSheet_(sheetName);
    var rowIndex = docData.rowIndex;
    var rowData = sheet.getRange(rowIndex, 1, 1, 9).getValues()[0];
    
    // Non-admin hanya bisa edit dokumen sendiri
    if (!access.viewAll && String(rowData[5]) !== String(session.id)) {
      return { success: false, message: 'Anda hanya dapat mengedit dokumen milik Anda sendiri.' };
    }
    
    // Update nama dokumen & kategori
    sheet.getRange(rowIndex, 3).setValue(docData.nama_dok);  // kolom C
    sheet.getRange(rowIndex, 5).setValue(docData.kategori);   // kolom E
    
    // Jika ada file pengganti
    if (docData.fileBase64 && docData.fileName) {
      // Hapus file lama dari Drive
      var oldFileId = rowData[8]; // kolom I (gdrive_file_id)
      if (oldFileId) {
        try { DriveApp.getFileById(oldFileId).setTrashed(true); } catch (err) {}
      }
      
      // Upload file baru
      var fileResult = uploadFileToDrive_(
        docData.fileBase64,
        docData.fileName,
        docData.mimeType,
        sheetName,
        session
      );
      
      if (fileResult.success) {
        var ext = docData.fileName.split('.').pop().toUpperCase();
        sheet.getRange(rowIndex, 4).setValue(ext);              // jenis_file
        sheet.getRange(rowIndex, 8).setValue(fileResult.fileUrl); // file_url
        sheet.getRange(rowIndex, 9).setValue(fileResult.fileId);  // gdrive_file_id
      }
    }
    
    return { success: true, message: 'Dokumen berhasil diperbarui!' };
    
  } catch (e) {
    if (e.message === 'SESSION_EXPIRED') return { success: false, message: 'SESSION_EXPIRED' };
    return { success: false, message: 'Gagal mengedit dokumen: ' + e.message };
  }
}

/**
 * deleteDocument() — Hapus dokumen.
 * @param {string} token
 * @param {string} sheetName
 * @param {number} rowIndex - Row index di sheet
 * @returns {Object} {success, message}
 */
function deleteDocument(token, sheetName, rowIndex) {
  try {
    var session = requireAuth_(token);
    var access = ROLE_ACCESS[session.role];
    
    if (access.crud.indexOf(sheetName) === -1) {
      return { success: false, message: 'Anda tidak memiliki izin untuk menghapus.' };
    }
    
    var sheet = getSheet_(sheetName);
    var rowData = sheet.getRange(rowIndex, 1, 1, 9).getValues()[0];
    
    // Non-admin hanya bisa hapus dokumen sendiri
    if (!access.viewAll && String(rowData[5]) !== String(session.id)) {
      return { success: false, message: 'Anda hanya dapat menghapus dokumen milik Anda sendiri.' };
    }
    
    // Hapus file dari Drive
    var fileId = rowData[8];
    if (fileId) {
      try { DriveApp.getFileById(fileId).setTrashed(true); } catch (err) {}
    }
    
    // Hapus row dari Sheet
    sheet.deleteRow(rowIndex);
    
    return { success: true, message: 'Dokumen berhasil dihapus!' };
    
  } catch (e) {
    if (e.message === 'SESSION_EXPIRED') return { success: false, message: 'SESSION_EXPIRED' };
    return { success: false, message: 'Gagal menghapus dokumen: ' + e.message };
  }
}

/**
 * getDashboardStats() — Hitung statistik dashboard.
 * @param {string} token
 * @returns {Object} {success, stats}
 */
function getDashboardStats(token) {
  try {
    var session = requireAuth_(token);
    var sheets = [SHEET_DOKUMEN_PRODI, SHEET_DOKUMEN_DOSEN, SHEET_DOKUMEN_TENDIK, SHEET_DOKUMEN_MHS];
    var stats = {};
    var recentActivities = [];
    
    for (var s = 0; s < sheets.length; s++) {
      var sheetName = sheets[s];
      var sheet = getSheet_(sheetName);
      var data = sheet.getDataRange().getValues();
      var count = 0;
      
      if (data.length > 1) {
        for (var i = 1; i < data.length; i++) {
          if (session.role === 'admin') {
            count++;
          } else {
            var access = ROLE_ACCESS[session.role];
            if (access.menu.indexOf(sheetName) !== -1) {
              if (access.viewAll || (access.viewOnly || []).indexOf(sheetName) !== -1) {
                count++;
              } else if (String(data[i][5]) === String(session.id)) {
                count++;
              }
            }
          }
          
          // Kumpulkan aktivitas terbaru
          if (i <= 5 && (session.role === 'admin' || String(data[i][5]) === String(session.id))) {
            var tglStr = (data[i][1] instanceof Date) ? formatDate_(data[i][1]) : String(data[i][1] || '');
            recentActivities.push({
              type: 'upload',
              nama_dok: data[i][2],
              uploader: data[i][6],
              tgl: tglStr,
              sheet: sheetName
            });
          }
        }
      }
      
      stats[sheetName] = count;
    }
    
    recentActivities.sort(function(a, b) {
      return String(b.tgl).localeCompare(String(a.tgl));
    });
    recentActivities = recentActivities.slice(0, 5);
    
    var total = 0;
    for (var key in stats) {
      total += stats[key];
    }
    
    return {
      success: true,
      stats: stats,
      total: total,
      activities: recentActivities,
      userName: session.nama,
      userRole: session.role
    };
    
  } catch (e) {
    if (e.message === 'SESSION_EXPIRED') return { success: false, message: 'SESSION_EXPIRED' };
    return { success: false, message: 'Gagal memuat dashboard: ' + e.message };
  }
}

/**
 * getAllData() — Muat SEMUA data dalam 1 panggilan server.
 * Mengurangi latency karena hanya butuh 1x round-trip ke server.
 * @param {string} token
 * @returns {Object} Seluruh data aplikasi
 */
function getAllData(token) {
  try {
    var session = requireAuth_(token);
    var access = ROLE_ACCESS[session.role];
    var allSheets = [SHEET_DOKUMEN_PRODI, SHEET_DOKUMEN_DOSEN, SHEET_DOKUMEN_TENDIK, SHEET_DOKUMEN_MHS];
    
    var result = {
      success: true,
      documents: {},
      stats: {},
      total: 0,
      activities: [],
      users: null,
      userName: session.nama,
      userRole: session.role,
      userId: session.id
    };
    
    var allActivities = [];
    
    // Fetch semua sheet dokumen
    for (var s = 0; s < allSheets.length; s++) {
      var sheetName = allSheets[s];
      
      // Skip jika role tidak punya akses
      if (access.menu.indexOf(sheetName) === -1) continue;
      
      var sheet = getSheet_(sheetName);
      var data = sheet.getDataRange().getValues();
      var docs = [];
      var count = 0;
      
      if (data.length > 1) {
        var headers = data[0];
        for (var i = 1; i < data.length; i++) {
          var row = data[i];
          var doc = {};
          for (var j = 0; j < headers.length; j++) {
            var val = row[j];
            if (val instanceof Date) {
              val = formatDate_(val);
            }
            doc[headers[j]] = val;
          }
          doc._rowIndex = i + 1;
          
          // Filter berdasarkan role
          var include = false;
          if (access.viewAll) {
            include = true;
          } else if ((access.viewOnly || []).indexOf(sheetName) !== -1) {
            include = true;
          } else if (String(doc.uploader_id) === String(session.id)) {
            include = true;
          }
          
          if (include) {
            docs.push(doc);
            count++;
          }
          
          // Aktivitas terbaru
          if (i <= 5 && (session.role === 'admin' || String(row[5]) === String(session.id))) {
            var tglStr = (row[1] instanceof Date) ? formatDate_(row[1]) : String(row[1] || '');
            allActivities.push({
              type: 'upload',
              nama_dok: row[2],
              uploader: row[6],
              tgl: tglStr,
              sheet: sheetName
            });
          }
        }
      }
      
      // Sort docs by date descending
      docs.sort(function(a, b) {
        return String(b.tgl_upload).localeCompare(String(a.tgl_upload));
      });
      
      result.documents[sheetName] = {
        data: docs,
        canCrud: access.crud.indexOf(sheetName) !== -1,
        isViewOnly: (access.viewOnly || []).indexOf(sheetName) !== -1,
        isAdmin: session.role === 'admin'
      };
      
      result.stats[sheetName] = count;
      result.total += count;
    }
    
    // Sort activities
    allActivities.sort(function(a, b) {
      return String(b.tgl).localeCompare(String(a.tgl));
    });
    var activityLimit = session.role === 'admin' ? 20 : 5;
    result.activities = allActivities.slice(0, activityLimit);
    
    // Jika admin, ambil daftar users juga
    if (session.role === 'admin') {
      var userSheet = getSheet_(SHEET_USERS);
      var userData = userSheet.getDataRange().getValues();
      var userHeaders = userData[0];
      var users = [];
      
      for (var u = 1; u < userData.length; u++) {
        var user = {};
        for (var h = 0; h < userHeaders.length; h++) {
          if (userHeaders[h] === 'password') {
            user[userHeaders[h]] = '••••••';
          } else {
            user[userHeaders[h]] = userData[u][h];
          }
        }
        user._rowIndex = u + 1;
        users.push(user);
      }
      
      result.users = users;
    }
    
    // Ambil daftar kategori dinamis
    result.categories = {};
    var ss = typeof getSpreadsheet_ === 'function' ? getSpreadsheet_() : SpreadsheetApp.getActiveSpreadsheet();
    var catSheet = ss.getSheetByName('Kategori_App');
    var hasDbCategories = false;
    if (catSheet) {
      var catData = catSheet.getDataRange().getValues();
      if (catData.length > 1) {
        hasDbCategories = true;
        var catHeaders = catData[0];
        var colTipe = catHeaders.indexOf('tipe_dokumen');
        var colNama = catHeaders.indexOf('nama_kategori');
        if (colTipe !== -1 && colNama !== -1) {
          for (var c = 1; c < catData.length; c++) {
            var typ = catData[c][colTipe];
            if (!result.categories[typ]) result.categories[typ] = [];
            result.categories[typ].push({ rowIndex: c + 1, nama: catData[c][colNama] });
          }
        }
      }
    }
    
    // Auto-migrasi: jika Kategori_App kosong/belum ada, isi dari KATEGORI_MAP
    if (!hasDbCategories && typeof KATEGORI_MAP !== 'undefined') {
      if (!catSheet) {
        catSheet = ss.insertSheet('Kategori_App');
        catSheet.appendRow(['tipe_dokumen', 'nama_kategori']);
      }
      for (var tipe in KATEGORI_MAP) {
        var items = KATEGORI_MAP[tipe];
        for (var k = 0; k < items.length; k++) {
          catSheet.appendRow([tipe, items[k]]);
        }
      }
      // Baca ulang data yang baru saja dimasukkan
      var newData = catSheet.getDataRange().getValues();
      for (var c = 1; c < newData.length; c++) {
        var typ = newData[c][0];
        if (!result.categories[typ]) result.categories[typ] = [];
        result.categories[typ].push({ rowIndex: c + 1, nama: newData[c][1] });
      }
    }
    
    return JSON.stringify(result);
    
  } catch (e) {
    if (e.message === 'SESSION_EXPIRED') return JSON.stringify({ success: false, message: 'SESSION_EXPIRED' });
    return JSON.stringify({ success: false, message: 'Gagal memuat data: ' + e.message });
  }
}

/**
 * updateProfilePic() — Mengubah foto profil user
 */
function updateProfilePic(token, fileBase64, mimeType, fileName) {
  try {
    var session = requireAuth_(token);
    
    var fileResult = uploadFileToDrive_(fileBase64, fileName, mimeType, 'Profil_User', session);
    if (!fileResult.success) return { success: false, message: 'Gagal mengupload profil: ' + fileResult.message };
    
    // Gunakan URL thumbnail langsung agar bisa ditampilkan di <img>
    var directUrl = 'https://lh3.googleusercontent.com/d/' + fileResult.fileId;
    
    var sheet = getSheet_(SHEET_USERS);
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var colId = headers.indexOf('id');
    var colFoto = headers.indexOf('foto_profil');
    
    if (colFoto === -1) {
      colFoto = headers.length;
      sheet.getRange(1, colFoto + 1).setValue('foto_profil');
    }
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][colId]) === String(session.id)) {
        sheet.getRange(i + 1, colFoto + 1).setValue(directUrl);
        
        var cache = CacheService.getScriptCache();
        var sessionDataStr = cache.get('session_' + token);
        if (sessionDataStr) {
          var sessionData = JSON.parse(sessionDataStr);
          sessionData.foto_profil = directUrl;
          cache.put('session_' + token, JSON.stringify(sessionData), 60 * 60 * 24);
          
          var props = PropertiesService.getUserProperties();
          props.setProperty('current_session', JSON.stringify(sessionData));
        }
        return { success: true, message: 'Foto profil diperbarui!', url: directUrl };
      }
    }
    return { success: false, message: 'User tidak ditemukan.' };
  } catch (e) {
    if (e.message === 'SESSION_EXPIRED') return { success: false, message: 'SESSION_EXPIRED' };
    return { success: false, message: 'Kesalahan sistem: ' + e.message };
  }
}

/**
 * Manajemen Kategori (Admin)
 */
function addCategory(token, tipe, nama) {
  try {
    var session = requireAuth_(token);
    if (session.role !== 'admin') return { success: false, message: 'Hanya Admin.' };
    var ss = typeof getSpreadsheet_ === 'function' ? getSpreadsheet_() : SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Kategori_App');
    if (!sheet) {
      sheet = ss.insertSheet('Kategori_App');
      sheet.appendRow(['tipe_dokumen', 'nama_kategori']);
    }
    
    sheet.appendRow([tipe, nama]);
    return { success: true, message: 'Kategori berhasil ditambahkan.' };
  } catch(e) {
    if (e.message === 'SESSION_EXPIRED') return { success: false, message: 'SESSION_EXPIRED' };
    return { success: false, message: e.message };
  }
}

function deleteCategory(token, rowIndex) {
  try {
    var session = requireAuth_(token);
    if (session.role !== 'admin') return { success: false, message: 'Hanya Admin.' };
    var ss = typeof getSpreadsheet_ === 'function' ? getSpreadsheet_() : SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Kategori_App');
    if (!sheet) return { success: false, message: 'Database kategori tidak ada.' };
    
    sheet.deleteRow(rowIndex);
    return { success: true, message: 'Kategori terhapus.' };
  } catch(e) {
    if (e.message === 'SESSION_EXPIRED') return { success: false, message: 'SESSION_EXPIRED' };
    return { success: false, message: e.message };
  }
}

function editCategory(token, rowIndex, newName) {
  try {
    var session = requireAuth_(token);
    if (session.role !== 'admin') return { success: false, message: 'Hanya Admin.' };
    var ss = typeof getSpreadsheet_ === 'function' ? getSpreadsheet_() : SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Kategori_App');
    if (!sheet) return { success: false, message: 'Database kategori tidak ada.' };
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var colNama = headers.indexOf('nama_kategori');
    if (colNama === -1) return { success: false, message: 'Kolom nama_kategori tidak ditemukan.' };
    
    sheet.getRange(rowIndex, colNama + 1).setValue(newName);
    return { success: true, message: 'Kategori berhasil diperbarui.' };
  } catch(e) {
    if (e.message === 'SESSION_EXPIRED') return { success: false, message: 'SESSION_EXPIRED' };
    return { success: false, message: e.message };
  }
}

function saveAppSettings(token, newSettings) {
  try {
    var session = requireAuth_(token);
    if (session.role !== 'admin') return { success: false, message: 'Hanya Admin.' };
    
    var props = PropertiesService.getScriptProperties();
    props.setProperty('app_title', newSettings.title);
    props.setProperty('app_prodi', newSettings.prodi);
    props.setProperty('app_desc', newSettings.desc);
    
    return { success: true, message: 'Pengaturan sistem berhasil disimpan.' };
  } catch(e) {
    if (e.message === 'SESSION_EXPIRED') return { success: false, message: 'SESSION_EXPIRED' };
    return { success: false, message: e.message };
  }
}
