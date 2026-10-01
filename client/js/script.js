document.addEventListener("DOMContentLoaded", () => {
    checkUserLoginStatus();
    injectNotificationModal();
});

function checkUserLoginStatus() {
    try {
        const userStr = localStorage.getItem('user');
        const navActions = document.querySelector('.nav-actions');
        const adminLink = document.getElementById('admin-nav-link');

        // כברירת מחדל, מסתירים את כפתור הניהול
        if (adminLink) {
            adminLink.style.display = 'none';
        }

        if (!userStr) return; // אם אין משתמש, הכפתור נשאר מוסתר

        const user = JSON.parse(userStr);
        
        // 1. שינוי התפריט העליון להצגת שם המשתמש המחובר וכפתור התנתקות בעיצוב תואם לאתר
        if (user && user.fullName && navActions) {
            navActions.innerHTML = `
                <div class="flex items-center gap-3 text-xs bg-[#163524] px-3 py-1.5 rounded-2xl border border-[#2d5a3f] shadow-sm">
                    <span class="text-white font-medium">שלום, ${user.fullName}</span>
                    <button onclick="logout()" title="התנתק" class="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition-all font-semibold border border-rose-500/30">התנתק</button>
                </div>
            `;
        }

        // 2. בדיקה האם המשתמש הוא מנהל מערכת - רק אז מציגים את הכפתור
        if (user && user.role === 'admin' && adminLink) {
            adminLink.style.display = 'flex';
        }
    } catch (error) {
        console.error("Error checking login status:", error);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showCustomModal('התנתקת בהצלחה מהמערכת', () => {
        window.location.href = 'index.html';
    });
}

function injectNotificationModal() {
    if (document.getElementById('custom-modal-overlay')) return;
    const modalHTML = `
    <div id="custom-modal-overlay" class="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm hidden">
        <div class="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4 text-center border border-gray-100 transform transition-all scale-95 opacity-0 duration-200" id="custom-modal-box">
            <div class="w-12 h-12 bg-emerald-50 text-[#1E4630] rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl shadow-inner">
                <i class="fa-solid fa-check"></i>
            </div>
            <h3 id="custom-modal-title" class="font-bold text-[#1E4630] text-base mb-1">הודעת מערכת</h3>
            <p id="custom-modal-message" class="text-gray-600 text-xs mb-5 leading-relaxed"></p>
            <button id="custom-modal-btn" onclick="closeCustomModal()" class="w-full py-2.5 bg-[#1E4630] text-white rounded-xl font-bold text-xs shadow-md hover:bg-[#163524] transition-all">אישור</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.showCustomModal = function(message, callback = null, title = "הודעת מערכת") {
    injectNotificationModal();
    const overlay = document.getElementById('custom-modal-overlay');
    const box = document.getElementById('custom-modal-box');
    document.getElementById('custom-modal-title').innerText = title;
    document.getElementById('custom-modal-message').innerText = message;
    
    overlay.classList.remove('hidden');
    setTimeout(() => {
        box.classList.remove('scale-95', 'opacity-0');
        box.classList.add('scale-100', 'opacity-100');
    }, 10);

    window.customModalCallback = callback;
};

window.closeCustomModal = function() {
    const overlay = document.getElementById('custom-modal-overlay');
    const box = document.getElementById('custom-modal-box');
    box.classList.remove('scale-100', 'opacity-100');
    box.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        overlay.classList.add('hidden');
        if (typeof window.customModalCallback === 'function') {
            const cb = window.customModalCallback;
            window.customModalCallback = null;
            cb();
        }
    }, 200);
};
window.showModalMessage = function(message) {
    // מחיקת פופ-אפ קודם אם קיים
    const existingModal = document.getElementById('custom-modal-popup');
    if (existingModal) existingModal.remove();

    // יצירת אלמנט הרקע והחלונית
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'custom-modal-popup';
    modalOverlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all';

    modalOverlay.innerHTML = `
        <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center transform scale-100 transition-transform">
            <div class="w-12 h-12 bg-[#1E4630]/10 text-[#1E4630] rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold shadow-inner">
                ✨
            </div>
            <h3 class="text-base font-extrabold text-[#1E4630] mb-1">VitaliFit</h3>
            <p class="text-gray-600 text-xs mb-6 whitespace-pre-line leading-relaxed">${message}</p>
            <button onclick="document.getElementById('custom-modal-popup').remove()" 
                class="w-full py-2.5 bg-[#1E4630] text-white rounded-xl text-xs font-bold hover:bg-[#163524] transition-all shadow-md">
                אישור
            </button>
        </div>
    `;

    document.body.appendChild(modalOverlay);
};
function showCustomMessageBox(message) {
    const modal = document.getElementById('custom-message-box');
    const messageText = document.getElementById('custom-message-text');

    if (modal && messageText) {
        messageText.textContent = message;
        modal.classList.remove('hidden');
    }
}

function closeCustomMessageBox() {
    const modal = document.getElementById('custom-message-box');

    if (modal) {
        modal.classList.add('hidden');
    }
}