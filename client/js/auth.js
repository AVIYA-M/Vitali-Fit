const API_URL = 'http://localhost:5000/api';

async function handleAuth(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        // במקרה של שגיאה בהתחברות
        if (!response.ok) {
            showModalMessage(`שגיאה בהתחברות: ${data.message || 'פרטים שגויים'}`);
            return;
        }

        // שמירת פרטי המשתמש בדפדפן
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // הודעת הצלחה מדויקת
        showModalMessage(`התחברת בהצלחה למערכת!\nברוך הבא, ${data.user.fullName}`);

        const params = new URLSearchParams(window.location.search);
        const redirectPage = params.get('redirect') || 'index.html';

        // מעבר לדף הבית
        setTimeout(() => {
            window.location.href = redirectPage;
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);
        showModalMessage('שגיאת תקשורת עם השרת. ודאי שהשרת פועל.');
    }
}