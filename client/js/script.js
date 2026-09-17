


// חלונות הודעה מותאמים אישית (Modal)
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
// יצירת מיכל לחלונות מודאליים
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('modal-container')) {
        const modalRoot = document.createElement('div');
        modalRoot.id = 'modal-container';
        document.body.appendChild(modalRoot);
    }
});


