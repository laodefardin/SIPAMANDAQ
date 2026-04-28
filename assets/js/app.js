// assets/js/app.js

// Mockup Data untuk Visualisasi Tabel
const dummyData = {
    prodi: [
        { id: 1, tgl: '28-04-2026', nama: 'Kurikulum Prodi PTI 2024 (MBKM)', kategori: 'Kurikulum', tipe: 'PDF', uploader: 'Admin Prodi' },
        { id: 2, tgl: '25-04-2026', nama: 'SOP Pelaksanaan Ujian Skripsi', kategori: 'SOP', tipe: 'PDF', uploader: 'Admin Prodi' },
        { id: 3, tgl: '20-04-2026', nama: 'Rekapitulasi Akreditasi 2023', kategori: 'Akreditasi', tipe: 'XLSX', uploader: 'Admin Prodi' }
    ],
    dosen: [
        { id: 1, tgl: '20-04-2026', nama: 'SK Mengajar Dosen Genap 2025/2026', kategori: 'SK Dosen', tipe: 'PDF', uploader: 'Ahmad Dosen' },
        { id: 2, tgl: '18-04-2026', nama: 'Sertifikat Seminar Nasional AI', kategori: 'Sertifikat Pelatihan/Seminar', tipe: 'JPG', uploader: 'Ahmad Dosen' },
        { id: 3, tgl: '12-04-2026', nama: 'Logbook Pengabdian Masyarakat', kategori: 'Bukti Tridarma', tipe: 'DOCX', uploader: 'Ahmad Dosen' }
    ],
    tendik: [
        { id: 1, tgl: '15-04-2026', nama: 'Laporan Kehadiran Tendik Bulan Maret', kategori: 'Presensi/Absensi Kepegawaian', tipe: 'XLSX', uploader: 'Tendik TU' },
        { id: 2, tgl: '10-04-2026', nama: 'Surat Tugas Panitia Wisuda', kategori: 'Surat Tugas', tipe: 'PDF', uploader: 'Tendik TU' }
    ],
    mahasiswa: [
        { id: 1, tgl: '10-04-2026', nama: 'KRS Ganjil Mahasiswa Angkatan 2024', kategori: 'KRS', tipe: 'PDF', uploader: 'Tendik TU' },
        { id: 2, tgl: '08-04-2026', nama: 'SK Lulus Yudisium Gelombang 1', kategori: 'SK Yudisium', tipe: 'PDF', uploader: 'Tendik TU' }
    ]
};

// Kategori options generator
const catOptions = {
    prodi: ['Kurikulum', 'SK Mengajar', 'SOP', 'Rencana Strategis (Renstra)', 'Rencana Operasional (Renop)', 'Dokumen Akreditasi', 'Panduan Akademik', 'Laporan Kinerja Prodi'],
    dosen: ['SK Dosen', 'Surat Tugas', 'Bukti Tridarma', 'Jurnal/Publikasi', 'Sertifikat Pendidik', 'Ijazah', 'CV', 'Sertifikat Pelatihan/Seminar'],
    tendik: ['SK Pengangkatan', 'Surat Tugas', 'Laporan Kinerja Tendik', 'Sertifikat Pelatihan Kepegawaian', 'Presensi/Absensi Kepegawaian', 'Biodata Pekerja'],
    mahasiswa: ['KRS', 'KHS', 'Transkrip Nilai', 'Proposal Skripsi/TA', 'SK Yudisium', 'SK Lulus', 'Surat Keterangan Aktif Kuliah', 'Surat Keterangan Cuti']
};

let currentUser = null;
let currentView = 'prodi';

document.addEventListener('DOMContentLoaded', () => {
    // Application Init (Ensure login screen is shown)
    document.getElementById('view-login').style.display = 'flex';
    document.getElementById('view-login').classList.add('active');
    document.getElementById('layout-app').classList.add('hidden');
});

// Sistem Autentikasi Dummy
function handleLogin(e) {
    if(e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }
    
    const userInput = document.getElementById('loginUsername');
    const user = userInput ? userInput.value.toLowerCase().trim() : '';
    const btn = document.querySelector('#loginForm button[type="submit"]');
    
    // UI Button state logic
    let originalText = '';
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Autentikasi...';
        btn.disabled = true;
    }
    
    setTimeout(() => {
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
        
        if(user === 'admin') {
            currentUser = { name: 'Koordinator Prodi', role: 'admin', initial: 'KP' };
        } else if (user === 'dosen') {
            currentUser = { name: 'Dosen Pengajar', role: 'dosen', initial: 'DP' };
        } else if (user === 'tendik') {
            currentUser = { name: 'Staff Administrasi', role: 'tendik', initial: 'SA' };
        } else {
            alert("Harap gunakan akun demo: admin / dosen / tendik");
            return;
        }

        initializeDashboard();
    }, 800); // simulate loading delay for UX feel
}

function initializeDashboard() {
    // Apply User Identity to UI globally
    document.getElementById('userNameDisplay').textContent = currentUser.name;
    document.getElementById('userRoleDisplay').textContent = currentUser.role === 'admin' ? 'Administrator' : currentUser.role;
    document.getElementById('userInitial').textContent = currentUser.initial;
    document.getElementById('mobileUserInitial').textContent = currentUser.initial;
    
    // Setting Page Profile Details Update
    document.getElementById('settingName').textContent = currentUser.name;
    document.getElementById('settingRole').textContent = currentUser.role === 'admin' ? 'Super Admin' : 'User Akses Standard';
    document.getElementById('settingUserInitial').textContent = currentUser.initial;
    document.getElementById('settingInputUsername').value = document.getElementById('loginUsername').value;

    // Filter Visibility per User Role Constraint
    adjustMenuByRole(currentUser.role);
    
    // Animate view switch
    document.getElementById('view-login').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('view-login').style.display = 'none';
        document.getElementById('layout-app').classList.remove('hidden');
        document.getElementById('view-login').style.opacity = '1'; // reset
        
        // Auto navigate home
        navigateTo('prodi');
    }, 300);
}

function handleLogout() {
    currentUser = null;
    document.getElementById('layout-app').classList.add('hidden');
    document.getElementById('view-login').style.display = 'flex';
    document.getElementById('loginForm').reset();
}

// Logic Rule-Based Access Control Menu Display
function adjustMenuByRole(role) {
    // Sembunyikan semuanya selain Prodi (yang universal punya akses) dan Setting
    ['dosen', 'tendik', 'mahasiswa'].forEach(id => {
        const item = document.getElementById(`nav-${id}`);
        if(item) item.closest('a').classList.add('hidden');
    });
    
    // Konfigurasi Navigasi Tampil
    if (role === 'admin') {
        ['dosen', 'tendik', 'mahasiswa'].forEach(id => document.getElementById(`nav-${id}`).closest('a').classList.remove('hidden'));
    } else if (role === 'dosen') {
        document.getElementById('nav-dosen').closest('a').classList.remove('hidden');
    } else if (role === 'tendik') {
        ['tendik', 'mahasiswa', 'dosen'].forEach(id => document.getElementById(`nav-${id}`).closest('a').classList.remove('hidden'));
    }
}

// Global Navigator Switch
function navigateTo(viewId) {
    currentView = viewId;
    
    // Manipulasi gaya state "Aktif" button navigasi sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-primary-50', 'text-primary-700', 'border-r-4', 'border-primary-600', 'font-bold');
        item.classList.add('text-gray-600');
        // Reset element styles to transparent
        const innerIconWrapper = item.querySelector('span');
        innerIconWrapper.classList.remove('bg-primary-100', 'border-primary-200');
        innerIconWrapper.classList.add('bg-gray-50', 'border-transparent');
        
        const innerIcon = item.querySelector('i');
        innerIcon.classList.remove('text-primary-600');
        innerIcon.classList.add('text-gray-400');
    });

    const activeMenu = document.getElementById(`nav-${viewId}`);
    if(activeMenu) {
        activeMenu.classList.add('bg-primary-50', 'text-primary-700', 'border-r-4', 'border-primary-600', 'font-bold');
        activeMenu.classList.remove('text-gray-600');
        const activeWrapper = activeMenu.querySelector('span');
        activeWrapper.classList.add('bg-primary-100', 'border-primary-200');
        activeWrapper.classList.remove('bg-gray-50', 'border-transparent');
        const activeIcon = activeMenu.querySelector('i');
        activeIcon.classList.add('text-primary-600');
        activeIcon.classList.remove('text-gray-400');
    }

    // Toggle Content Panels Visibility
    document.querySelectorAll('.content-view').forEach(view => view.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');

    // Update Text Page Header
    const titles = {
        prodi: ['Dokumen Prodi', 'Kelola arsip resmi tingkat Program Studi Pendidikan Teknologi Informasi.'],
        dosen: ['Dokumen Dosen', 'Kelola arsip pengajaran dan legalitas tridarma individu dosen.'],
        tendik: ['Dokumen Tendik', 'Kelola arsip tata usaha dan kepegawaian tenaga pendidik.'],
        mahasiswa: ['Dokumen Mahasiswa', 'Kelola pengadministrasian transkrip akademik mahasiswa.'],
        setting: ['Pengaturan Keamanan', 'Kelola preferensi akun otentikasi login personal Anda.']
    };

    document.getElementById('pageTitle').textContent = titles[viewId][0];
    const pageDesc = document.getElementById('pageDesc');
    pageDesc.innerHTML = `<i class="fa-solid fa-circle-info mr-1.5 text-gray-400"></i> ${titles[viewId][1]}`;

    // Menangani button state action di kanan header
    if(viewId === 'setting') {
        document.getElementById('headerActions').classList.add('hidden');
    } else {
        document.getElementById('headerActions').classList.remove('hidden');
        renderTableViewBasedOnID(viewId);
    }
    
    // Auto-close overlay sidebar pada mobile responsive phone layer
    if(window.innerWidth < 768 && !document.getElementById('sidebar').classList.contains('-translate-x-full')) {
        toggleSidebar();
    }
}

// Side-Nav Mobile Collapse behavior
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    
    if (sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
        backdrop.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
    }
}

// Builder Data Table Layout
function renderTableViewBasedOnID(type) {
    let rowsHtml = '';
    const data = dummyData[type] || [];
    
    if (data.length === 0) {
        rowsHtml = `<tr><td colspan="6" class="px-6 py-12 text-center text-gray-400 font-medium bg-gray-50/50"><i class="fa-regular fa-folder-open text-4xl block mb-3 text-gray-300"></i> Folder Arsip Kosong / Belum ada Berkas</td></tr>`;
    } else {
        data.forEach(item => {
            // Icon Styling Dynamics
            const isPDF = item.tipe === 'PDF';
            const isXLS = item.tipe === 'XLSX';
            
            const typeClass = isPDF ? 'text-red-500 bg-red-50 border-red-100' : 
                             (isXLS ? 'text-green-600 bg-green-50 border-green-100' : 'text-blue-600 bg-blue-50 border-blue-100');
            const iconClass = isPDF ? 'fa-file-pdf' : 
                             (isXLS ? 'fa-file-excel' : (item.tipe === 'DOCX' ? 'fa-file-word text-blue-600' : 'fa-image text-purple-600'));
            
            // Check Admin role logic requirement (Admin features Uploader Name visible)
            const uploaderColRender = currentUser.role === 'admin' ? 
                `<td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(item.uploader)}&background=random&color=fff&size=24" class="rounded-full shadow-sm mr-2.5 outline outline-1 outline-gray-200">
                        <span class="text-sm font-medium text-gray-700">${item.uploader}</span>
                    </div>
                 </td>` : 
                `<!-- uploader column hidden for non admin -->`;

            rowsHtml += `
            <tr class="hover:bg-primary-50/50 group cursor-pointer transition-all">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 group-hover:text-gray-900">${item.tgl}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl border ${typeClass} shadow-sm group-hover:scale-105 transition-transform">
                            <i class="fa-solid ${iconClass} text-lg"></i>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-bold text-gray-900 leading-tight">${item.nama}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2.5 py-1 rounded-md bg-gray-100/80 text-gray-700 text-xs font-bold border border-gray-200 uppercase tracking-widest shadow-sm">
                        ${item.kategori}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="text-xs font-black text-gray-400 group-hover:text-gray-600 transition-colors uppercase tracking-widest">${item.tipe}</span>
                </td>
                ${uploaderColRender}
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div class="flex justify-center flex-nowrap items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button class="w-8 h-8 rounded-lg text-primary-600 bg-primary-50 border border-transparent hover:border-primary-100 hover:bg-primary-100 transition-all focus:ring-2 focus:ring-primary-500" title="Tinjau">
                            <i class="fa-solid fa-eye text-sm"></i>
                        </button>
                        <button class="w-8 h-8 rounded-lg text-amber-600 bg-amber-50 border border-transparent hover:border-amber-100 hover:bg-amber-100 transition-all focus:ring-2 focus:ring-amber-500" title="Ubah Data">
                            <i class="fa-solid fa-pen-to-square text-sm"></i>
                        </button>
                        <button class="w-8 h-8 rounded-lg text-red-600 bg-red-50 border border-transparent hover:border-red-100 hover:bg-red-100 transition-all focus:ring-2 focus:ring-red-500" title="Bersihkan">
                            <i class="fa-solid fa-trash-can text-sm"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        });
    }

    const container = document.getElementById(`view-${type}`);
    if (container) {
        container.innerHTML = generateFullTableStructureHTML(rowsHtml, type);
    }
}

// Table Wrapper DOM Injection
function generateFullTableStructureHTML(rowsHtml, type) {
    const isProdiReadonlyConstraint = (type === 'prodi' && currentUser.role !== 'admin');
    
    // Inject custom header th column if admin role
    const uploaderThNode = currentUser.role === 'admin' ? '<th scope="col" class="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest bg-gray-50/80 border-b border-gray-200">Uploader</th>' : '';
    
    return `
    <div class="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden relative pb-1">
        <!-- Top Toolbar Filter Tools -->
        <div class="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-white relative z-10">
            <div class="relative max-w-sm w-full">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i class="fa-solid fa-magnifying-glass text-gray-400"></i>
                </div>
                <input type="text" class="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 outline-none transition-all focus:bg-white placeholder-gray-400" placeholder="Pencarian nama arsip dokumen...">
            </div>
            
            <div class="relative w-full sm:w-64">
                <select class="block w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-700 bg-gray-50 outline-none appearance-none transition-all focus:bg-white cursor-pointer hover:border-gray-300">
                    <option value="" class="font-bold">🚀 Semua Kategori Tampil</option>
                    ${(catOptions[type] || []).map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                     <i class="fa-solid fa-chevron-down text-xs"></i>
                </div>
            </div>
        </div>
        
        <!-- Tabel Responsif Data Content Wrapper -->
        <div class="overflow-x-auto w-full">
            <table class="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th scope="col" class="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/80 w-36 border-b border-gray-200">Tgl. Publikasi</th>
                        <th scope="col" class="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/80 border-b border-gray-200">Identitas Dokumen</th>
                        <th scope="col" class="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/80 border-b border-gray-200">Kelas Kategori</th>
                        <th scope="col" class="px-6 py-4 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/80 w-24 border-b border-gray-200">Ekstensi</th>
                        ${uploaderThNode}
                        <th scope="col" class="px-6 py-4 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/80 w-44 border-b border-gray-200">Tindakan <i class="fa-solid fa-bolt ml-1"></i></th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
        
        <!-- Table Bottom Pagination Helper -->
        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-400 bg-gray-50/50 uppercase tracking-wider">
            <span>Ditemukan total ${dummyData[type]?.length || 0} hasil pada pencarian tab ini.</span>
        </div>
    </div>
    `;
}

// Global Modal Controller Event Logic
function openUploadModal() {
    const modal = document.getElementById('modal-upload');
    const catSelect = document.getElementById('modalKategori');
    
    // Prevent UI Breakage opening modal locally in settings tab
    if(currentView === 'setting') return;

    // Dynamically Inject specific form options into select form based on the layout constraint
    catSelect.innerHTML = '<option value="">Pilih Kategori Terlebih Dahulu...</option>' + 
        (catOptions[currentView] || []).map(cat => `<option value="${cat}">${cat}</option>`).join('');

    modal.classList.remove('hidden');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.add('hidden');
    }
}

// Auto fill for Demo UI Convenience
function autoFillAndLogin(role) {
    const userField = document.getElementById('loginUsername');
    const passField = document.getElementById('loginPassword');
    
    if (userField) userField.value = role;
    if (passField) passField.value = '123456';
    
    // Langsung tembak ke fungsi login tanpa memicu rekayasa Event dari DOM Form
    handleLogin();
}
