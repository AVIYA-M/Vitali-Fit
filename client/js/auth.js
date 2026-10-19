// ==========================================
// ניהול הרשמה והתחברות (auth.js)
// ==========================================

async function handleRegister(event) {
    event.preventDefault();

    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const msgBox = document.getElementById('register-message');

    // בדיקה שהשדות קיימים בטופס
    if (!fullNameInput || !emailInput || !passwordInput) {
        console.error('אחד מהשדות בטופס ההרשמה לא נמצא');
        return;
    }

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'שגיאה ביצירת החשבון');
        }

        // הצגת הודעת הצלחה מרגיעה למשתמשת
        if (msgBox) {
            msgBox.className = 'p-3 rounded-xl text-xs font-bold text-center bg-green-100 text-green-700 border border-green-200';
            msgBox.textContent = 'החשבון נוצר בהצלחה! מעביר אותך לדף ההתחברות...';
            msgBox.classList.remove('hidden');
        } else {
            alert('החשבון נוצר בהצלחה! מעביר אותך לדף ההתחברות...');
        }

        // מעבר אוטומטי לדף ההתחברות אחרי שנייה וחצי
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        if (msgBox) {
            msgBox.className = 'p-3 rounded-xl text-xs font-bold text-center bg-red-100 text-red-700 border border-red-200';
            msgBox.textContent = error.message;
            msgBox.classList.remove('hidden');
        } else {
            alert(error.message);
        }
    }
}

// פונקציית התחברות (לשימוש ב-login.html אם נדרש)
async function handleLogin(event) {
    event.preventDefault();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const msgBox = document.getElementById('login-message');

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'אימייל או סיסמה שגויים');
        }

        // שמירת הטוקן ופרטי המשתמש
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (msgBox) {
            msgBox.className = 'p-3 rounded-xl text-xs font-bold text-center bg-green-100 text-green-700 border border-green-200';
            msgBox.textContent = 'התחברת בהצלחה! מעבר ללוח המעקב...';
            msgBox.classList.remove('hidden');
        }

        setTimeout(() => {
            window.location.href = 'tracking.html';
        }, 1000);

    } catch (error) {
        if (msgBox) {
            msgBox.className = 'p-3 rounded-xl text-xs font-bold text-center bg-red-100 text-red-700 border border-red-200';
            msgBox.textContent = error.message;
            msgBox.classList.remove('hidden');
        } else {
            alert(error.message);
        }
    }
}
