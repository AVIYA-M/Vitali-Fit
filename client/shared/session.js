export function getToken() {
    return localStorage.getItem('token');
}

export function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (error) {
        console.error('Unable to read the saved user session:', error);
        clearSession();
        return null;
    }
}

export function isAuthenticated() {
    return Boolean(getToken() && getUser());
}

export function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    localStorage.removeItem('name');
}

export function logout(redirectTo = 'index.html') {
    clearSession();
    location.href = redirectTo;
}

export function requireAuth(role) {
    const user = getUser();
    if (!getToken() || !user) {
        location.href = 'login.html';
        return false;
    }
    if (role && user.role !== role) {
        location.href = 'index.html';
        return false;
    }
    return true;
}

export function initializeSessionNavigation() {
    const user = getUser();
    const navActions = document.querySelector('.nav-actions');
    const adminLink = document.getElementById('admin-nav-link');

    adminLink?.classList.toggle('admin-link-hidden', user?.role !== 'admin');
    if (!getToken() || !user || !navActions) return;

    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';

    const userName = document.createElement('span');
    userName.className = 'user-menu-name';
    userName.textContent = `שלום, ${user.fullName || ''}`;

    const logoutButton = document.createElement('button');
    logoutButton.type = 'button';
    logoutButton.className = 'logout-button';
    logoutButton.title = 'התנתק';
    logoutButton.textContent = 'התנתק';
    logoutButton.addEventListener('click', () => {
        import('./ui/modal.js').then(({ showMessage }) =>
            showMessage('התנתקת בהצלחה מהמערכת', {
                onClose: () => logout()
            })
        );
    });

    userMenu.append(userName, logoutButton);
    navActions.replaceChildren(userMenu);
}
