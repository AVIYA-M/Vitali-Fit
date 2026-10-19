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
               <div class="user-menu">
                <span class="user-menu-name">שלום, ${user.fullName}</span>

                  <button
                    onclick="logout()"
                    title="התנתק"
                    class="logout-button">
                    התנתק
                  </button>
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
};


function logout() { 
    console.log('פונקציית logout הופעלה'); 
    showCustomModal('התנתקת בהצלחה מהמערכת', () => { 
        console.log('כפתור האישור נלחץ'); 
    localStorage.removeItem('token'); 
    localStorage.removeItem('user'); 
    window.location.href = 'index.html'; }); }


function injectNotificationModal() {
    if (document.getElementById('custom-modal-overlay')) return;

    const modalHTML = `
        <div id="custom-modal-overlay" class="modal-overlay hidden">
            <div class="modal-box" id="custom-modal-box">

                <div class="modal-icon">
                    <i class="fa-solid fa-check"></i>
                </div>

                <h3 id="custom-modal-title" class="modal-title">
                    הודעת מערכת
                </h3>

                <p id="custom-modal-message" class="modal-message"></p>

                <button
                    id="custom-modal-btn"
                    onclick="closeCustomModal()"
                    class="modal-button">
                    אישור
                </button>

            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.showCustomModal = function (
    message,
    callback = null,
    title = "הודעת מערכת"
) {
    injectNotificationModal();

    const overlay = document.getElementById('custom-modal-overlay');
    const box = document.getElementById('custom-modal-box');

    document.getElementById('custom-modal-title').innerText = title;
    document.getElementById('custom-modal-message').innerText = message;

    overlay.classList.remove('hidden');

    setTimeout(() => {
        box.classList.add('modal-visible');
    }, 10);

    window.customModalCallback = callback;
};

window.closeCustomModal = function () {
    const overlay = document.getElementById('custom-modal-overlay');
    const box = document.getElementById('custom-modal-box');

    if (!overlay || !box) return;

    box.classList.remove('modal-visible');

    setTimeout(() => {
        overlay.classList.add('hidden');

        if (typeof window.customModalCallback === 'function') {
            const callback = window.customModalCallback;

            window.customModalCallback = null;

            callback();
        }
    }, 200);
};
window.showModalMessage = function (message) {
// מחיקת פופ-אפ קודם אם קיים
const existingModal = document.getElementById('custom-modal-popup');
if (existingModal) existingModal.remove();


// יצירת הרקע של החלונית
const modalOverlay = document.createElement('div');
modalOverlay.id = 'custom-modal-popup';
modalOverlay.className = 'custom-popup-overlay';

// יצירת תוכן החלונית
modalOverlay.innerHTML = `
    <div class="custom-popup-box">
        <div class="custom-popup-icon">✨</div>
        <h3 class="custom-popup-title">VitaliFit</h3>
        <p class="custom-popup-message"></p>
        <button class="custom-popup-button"
            onclick="document.getElementById('custom-modal-popup').remove()">
            אישור
        </button>
    </div>
`;

// הוספת ההודעה לחלונית
modalOverlay.querySelector('.custom-popup-message').textContent = message;

// הצגת החלונית בדף
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
document.addEventListener('DOMContentLoaded', () => {
    // יצירה אוטומטית של כפתור הגלילה הצף בכל עמוד
    if (!document.querySelector('.floating-scroll-btn')) {
        const scrollBtn = document.createElement('button'); // נהפוך את זה לכפתור אמיתי
        scrollBtn.className = 'floating-scroll-btn';
        scrollBtn.setAttribute('aria-label', 'גלול לפוטר');
       scrollBtn.innerHTML = '<i class="fa-solid fa-arrow-down floating-scroll-icon"></i>';
        // פעולת גלילה חלקה לפוטר בכל עמוד באופן אוטומטי
        scrollBtn.addEventListener('click', () => {
            const footer = document.querySelector('footer') || document.getElementById('footer');
            if (footer) {
                footer.scrollIntoView({ behavior: 'smooth' });
            }
        });

        // הוספה לגוף העמוד
        document.body.appendChild(scrollBtn);
    }
});