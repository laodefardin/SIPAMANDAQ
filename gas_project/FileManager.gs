/**
 * ============================================================
 * FileManager.gs — Manajemen File Google Drive
 * ============================================================
 */

/**
 * uploadFileToDrive_() — Upload file dari Base64 ke Google Drive.
 * @param {string} base64Data - Data file dalam Base64
 * @param {string} fileName - Nama file
 * @param {string} mimeType - MIME type file
 * @param {string} sheetName - Sheet yang menentukan folder target
 * @param {Object} session - Data session user
 * @returns {Object} {success, fileUrl, fileId}
 */
function uploadFileToDrive_(base64Data, fileName, mimeType, sheetName, session) {
  try {
    var rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
    
    // Tentukan folder tujuan berdasarkan sumber sheet
    var categoryFolderName = SHEET_TO_FOLDER[sheetName] || sheetName;
    var categoryFolder = getOrCreateFolder_(rootFolder, categoryFolderName);
    
    var targetFolder;
    
    // Untuk Prodi: simpan langsung di folder Prodi
    // Untuk Dosen/Tendik/Mahasiswa: buat subfolder per user
    if (sheetName === SHEET_DOKUMEN_PRODI) {
      targetFolder = categoryFolder;
    } else {
      // Buat subfolder per user: "[NIP/Username]_[Nama]"
      var userFolderName = session.username + '_' + session.nama.replace(/[^a-zA-Z0-9\s.,]/g, '').trim();
      targetFolder = getOrCreateFolder_(categoryFolder, userFolderName);
    }
    
    // Decode Base64 dan buat file
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    var file = targetFolder.createFile(blob);
    
    // Set file accessible via link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return {
      success: true,
      fileUrl: file.getUrl(),
      fileId: file.getId()
    };
    
  } catch (e) {
    return {
      success: false,
      message: e.message
    };
  }
}

/**
 * getOrCreateFolder_() — Dapatkan atau buat folder jika belum ada.
 * @param {Folder} parentFolder - Folder induk
 * @param {string} folderName - Nama folder yang dicari/dibuat
 * @returns {Folder} Folder yang ditemukan/dibuat
 */
function getOrCreateFolder_(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

/**
 * getFilePreviewUrl() — Generate preview URL untuk file di Drive.
 * @param {string} fileId - Google Drive file ID
 * @returns {string} Preview URL
 */
function getFilePreviewUrl(fileId) {
  if (!fileId) return '';
  return 'https://drive.google.com/file/d/' + fileId + '/preview';
}

/**
 * getFileDownloadUrl() — Generate download URL untuk file di Drive.
 * @param {string} fileId - Google Drive file ID
 * @returns {string} Download URL
 */
function getFileDownloadUrl(fileId) {
  if (!fileId) return '';
  return 'https://drive.google.com/uc?export=download&id=' + fileId;
}

/**
 * getFileViewUrl() — Generate view URL (buka di tab baru).
 * @param {string} fileId
 * @returns {string} View URL
 */
function getFileViewUrl(fileId) {
  if (!fileId) return '';
  return 'https://drive.google.com/file/d/' + fileId + '/view';
}
