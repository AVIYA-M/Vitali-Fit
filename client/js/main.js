document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    const isWorkouts = path.includes('workouts.html');

    const headerHTML = `
        <header class="site-header">
            <div class="header-container">
                <div class="header-actions">
                    <a href="index.html" class="btn-join">הצטרף עכשיו</a>
                    <a href="#" class="btn-profile">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </a>
                </div>
                <nav class="main-nav">
                    <a href="index.html" class="nav-link ${!isWorkouts ? 'active' : ''}">דף הבית</a>
                    <a href="workouts.html" class="nav-link ${isWorkouts ? 'active' : ''}">תוכניות</a>
                    <a href="nutrition.html" class="nav-link">תזונה</a>
                    <a href="admin.html" class="nav-link">ניהול משתמשים</a>
                </nav>
                <div class="logo-container">
                    <a href="index.html">
                        <img src="images/logo.png" alt="VitaliFit Logo">
                    </a>
                </div>
            </div>
        </header>
    `;

    const footerHTML = `
        <footer class="site-footer">
            <div class="footer-container">
                <div class="footer-top">
                    <div class="newsletter-form">
                        <input type="email" placeholder="כתובת אימייל" class="newsletter-input">
                        <button class="newsletter-btn">שליחה</button>
                    </div>
                    <div class="footer-title">הצטרפי לניוזלטר שלנו</div>
                </div>
                <hr class="footer-divider">
                <div class="footer-bottom">
                    © VitaliFit 2026 - ויטאליפיט. כל הזכויות שמורות.
                </div>
            </div>
        </footer>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);
});