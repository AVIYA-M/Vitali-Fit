const API_URL_CONTACT = `${window.API_BASE_URL}/api/contact`;
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');

    if (!form) {
        return;
    }

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
            const response = await fetch(API_URL_CONTACT, {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'שליחת הפנייה נכשלה.'
                );
            }

            // הודעת הצלחה רק לאחר שהשרת אישר את השמירה
            showStatus(
                data.message || 'הפנייה התקבלה בהצלחה.',
                'success'
            );

            form.reset();

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
        status.className = 'text-sm';

        if (state === 'success') {
            status.classList.add('text-green-700');
        }

        if (state === 'error') {
            status.classList.add('text-red-600');
        }
    }
});