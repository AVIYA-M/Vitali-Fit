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
        // כברירת מחדל, מסתירים את קישור הניהול
        if (adminLink) {
            adminLink.classList.add('admin-link-hidden');
        }

        // אם אין משתמש מחובר, משאירים את התפריט המקורי
        if (!userStr) return;

        const user = JSON.parse(userStr);

        // הצגת שם המשתמש וכפתור ההתנתקות
        if (user && user.fullName && navActions) {
            const userMenu = document.createElement('div');
            userMenu.className = 'user-menu';

            const userName = document.createElement('span');
            userName.className = 'user-menu-name';
            userName.textContent = `שלום, ${user.fullName}`;

            const logoutButton = document.createElement('button');
            logoutButton.className = 'logout-button';
            logoutButton.title = 'התנתק';
            logoutButton.textContent = 'התנתק';

            logoutButton.addEventListener('click', logout);

            userMenu.append(userName, logoutButton);

            navActions.replaceChildren(userMenu);
        }

        // הצגת קישור הניהול למנהלים בלבד
        // הצגת קישור הניהול למנהלים בלבד
        if (user && user.role === 'admin' && adminLink) {
            adminLink.classList.remove('admin-link-hidden');
        }
    } catch (error) {
        console.error('Error checking login status:', error);
    }
}


function logout() {
    console.log('פונקציית logout הופעלה');
    showCustomModal('התנתקת בהצלחה מהמערכת', () => {
        console.log('כפתור האישור נלחץ');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}


function injectNotificationModal() {
    if (document.getElementById('custom-modal-overlay')) return;

    // יצירת הרקע של החלונית
    const overlay = document.createElement('div');
    overlay.id = 'custom-modal-overlay';
    overlay.className = 'modal-overlay hidden';

    // יצירת גוף החלונית
    const box = document.createElement('div');
    box.className = 'modal-box';
    box.id = 'custom-modal-box';

    // אייקון
    const iconContainer = document.createElement('div');
    iconContainer.className = 'modal-icon';

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-check';

    iconContainer.appendChild(icon);

    // כותרת
    const title = document.createElement('h3');
    title.id = 'custom-modal-title';
    title.className = 'modal-title';
    title.textContent = 'הודעת מערכת';

    // הודעה
    const message = document.createElement('p');
    message.id = 'custom-modal-message';
    message.className = 'modal-message';

    // כפתור אישור
    const button = document.createElement('button');
    button.id = 'custom-modal-btn';
    button.className = 'modal-button';
    button.textContent = 'אישור';

    button.addEventListener('click', closeCustomModal);

    // הרכבת החלונית
    box.append(iconContainer, title, message, button);
    overlay.appendChild(box);

    // הוספת החלונית לדף
    document.body.appendChild(overlay);
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

    // מחיקת חלונית קודמת אם קיימת
    const existingModal = document.getElementById('custom-modal-popup');

    if (existingModal) {
        existingModal.remove();
    }

    // יצירת הרקע של החלונית
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'custom-modal-popup';
    modalOverlay.className = 'custom-popup-overlay';

    // יצירת גוף החלונית
    const modalBox = document.createElement('div');
    modalBox.className = 'custom-popup-box';

    // אייקון
    const icon = document.createElement('div');
    icon.className = 'custom-popup-icon';
    icon.textContent = '✨';

    // כותרת
    const title = document.createElement('h3');
    title.className = 'custom-popup-title';
    title.textContent = 'VitaliFit';

    // הודעה
    const messageElement = document.createElement('p');
    messageElement.className = 'custom-popup-message';
    messageElement.textContent = message;

    // כפתור אישור
    const button = document.createElement('button');
    button.className = 'custom-popup-button';
    button.textContent = 'אישור';

    button.addEventListener('click', () => {
        modalOverlay.remove();
    });

    // הרכבת החלונית
    modalBox.append(icon, title, messageElement, button);
    modalOverlay.appendChild(modalBox);

    // הצגת החלונית
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

        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-arrow-down floating-scroll-icon';

        scrollBtn.appendChild(icon);


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