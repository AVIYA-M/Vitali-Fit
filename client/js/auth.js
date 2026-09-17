function handleAuth(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const email = form.querySelector('input[type="email"]')?.value.trim() || 'משתמש';

    showCustomMessageBox(`התחברת בהצלחה למערכת VitaliFit!\nברוך הבא, ${email}`);

    const params = new URLSearchParams(window.location.search);
    const redirectPage = params.get('redirect') || 'index.html';

    setTimeout(() => {
        window.location.href = redirectPage;
    }, 600);
}

function handleRegister(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const name = form.querySelector('input[type="text"]')?.value.trim() || 'משתמש חדש';

    showCustomMessageBox(`ההרשמה בוצעה בהצלחה!\nברוכים הבאים, ${name}`);

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 600);
}