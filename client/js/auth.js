import { login, register } from '../services/auth.js';
import { showMessage } from '../shared/ui/modal.js';

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

registerForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const messageBox = document.getElementById('register-message');

    try {
        const data = await register({ fullName, email, password });
        if (!data?.token || !data.user) throw new Error('ההרשמה הושלמה, אך פרטי ההתחברות חסרים.');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showAuthMessage(messageBox, 'החשבון נוצר בהצלחה! מעבירה אותך ללוח המעקב...', true);
        setTimeout(() => { location.href = 'tracking.html'; }, 1500);
    } catch (error) {
        showAuthMessage(messageBox, error.message);
    }
});

loginForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const messageBox = document.getElementById('login-message');

    try {
        const data = await login({ email, password });
        if (!data?.token || !data.user) throw new Error('פרטי ההתחברות שהוחזרו מהשרת אינם תקינים.');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showAuthMessage(messageBox, 'התחברת בהצלחה! מעבירה ללוח המעקב...', true);
        setTimeout(() => { location.href = 'tracking.html'; }, 1000);
    } catch (error) {
        showAuthMessage(messageBox, error.message);
    }
});

function showAuthMessage(element, message, success = false) {
    if (!element) {
        showMessage(message);
        return;
    }

    const formName = element.id === 'login-message' ? 'login' : 'register';
    element.className = `${formName}-message ${formName}-message-${success ? 'success' : 'error'}`;
    element.textContent = message;
    element.classList.remove('hidden');
}
