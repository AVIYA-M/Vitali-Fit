import { submitContact } from '../services/contact.js';

const form = document.getElementById('contact-form');

if (form) {

    const status = document.getElementById('contact-form-status');
    const submitButton = document.getElementById('contact-submit-button');

    const originalButtonText = submitButton.textContent.trim();

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // בדיקת השדות בדפדפן
        if (!form.reportValidity()) {
            return;
        }

        // איסוף הנתונים מהטופס
        const payload = {
            name: document.getElementById('contact-name').value.trim(),
            email: document.getElementById('contact-email').value.trim(),
            subject: document.getElementById('contact-subject').value.trim(),
            message: document.getElementById('contact-message').value.trim()
        };

        // איפוס הודעה קודמת
        showStatus('', '');

        // מניעת לחיצה נוספת בזמן השליחה
        submitButton.disabled = true;
        submitButton.textContent = 'שולחת...';

        try {
            const data = await submitContact(payload);

            // הודעת הצלחה רק לאחר שהשרת אישר את השמירה
            showStatus(
                data.message || 'הפנייה התקבלה בהצלחה.',
                'success'
            );

        form?.reset();
        } catch (error) {
            console.error('שגיאה בשליחת טופס יצירת קשר:', error);

            showStatus(
                error.message || 'לא ניתן להתחבר לשרת. נסי שוב מאוחר יותר.',
                'error'
            );

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });

    function showStatus(message, state) {
        if (!status) {
            return;
        }

        status.textContent = message;
        status.className = 'contact-form-status';

        if (state === 'success') {
            status.classList.add('contact-form-status-success');
        }

        if (state === 'error') {
            status.classList.add('contact-form-status-error');
        }
    }


}