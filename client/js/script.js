import { initializeSessionNavigation } from '../shared/session.js';

initializeSessionNavigation();

if (!document.querySelector('.floating-scroll-btn')) {
    const scrollButton = document.createElement('button');
    scrollButton.type = 'button';
    scrollButton.className = 'floating-scroll-btn';
    scrollButton.setAttribute('aria-label', 'גלול לפוטר');

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-arrow-down floating-scroll-icon';
    scrollButton.append(icon);

    scrollButton.addEventListener('click', () => {
        document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
    });
    document.body.append(scrollButton);
}
