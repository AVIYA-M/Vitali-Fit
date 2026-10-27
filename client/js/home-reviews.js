import { listApprovedReviews, submitReview } from '../services/reviews.js';
import { getToken, getUser } from '../shared/session.js';
import { showMessage } from '../shared/ui/modal.js';

const reviewsContainer = document.getElementById('reviews-container');
const reviewFormSection = document.getElementById('review-form-section');
const reviewForm = document.getElementById('review-form');
const nameInput = document.getElementById('review-name');
const anonymousCheckbox = document.getElementById('anonymous-checkbox');
const successMsg = document.getElementById('review-success-msg');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const carouselWrapper = document.getElementById('carousel-wrapper');
let currentIndex = 0;

if (reviewsContainer) {
    loadReviews();
    initializeReviewForm();
}

// טוענת מהשרת את ההמלצות המאושרות ומציגה אותן.
async function loadReviews() {
    try {
        displayReviews(await listApprovedReviews());
    } catch (error) {
        console.error('שגיאה בטעינת ההמלצות:', error);
        displayReviews([]);
    }
}

// בונה את כרטיסי ההמלצות בעמוד ומפעילה את הקרוסלה.
function displayReviews(reviews) {
    reviewsContainer.replaceChildren();

    reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-item-card';

        const text = document.createElement('p');
        text.textContent = `"${review.text ?? ''}"`;

        const footer = document.createElement('div');
        footer.className = 'review-item-footer';

        const avatar = document.createElement('div');
        avatar.className = 'review-item-avatar';
        avatar.textContent = String(review.name ?? '').charAt(0);

        const name = document.createElement('h4');
        name.className = 'review-item-name';
        name.textContent = review.name ?? '';

        footer.append(avatar, name);
        card.append(text, footer);
        reviewsContainer.append(card);
    });

    setupCarousel();
}

// מפעילה את גלילת ההמלצות (קרוסלה) עם כפתורי הבא/הקודם.
function setupCarousel() {
    const firstCard = reviewsContainer.firstElementChild;
    if (!firstCard || !carouselWrapper) return;

    // מזיזה את הקרוסלה למיקום הנוכחי ומגבילה אותו לטווח התקין.
    const updateCarousel = () => {
        const cardWidth = firstCard.offsetWidth + 20;
        const maxVisible = Math.floor(carouselWrapper.offsetWidth / cardWidth);
        const maxIndex = Math.max(0, reviewsContainer.children.length - Math.max(1, maxVisible));
        currentIndex = Math.min(Math.max(currentIndex, 0), maxIndex);
        reviewsContainer.style.transform = `translateX(${currentIndex * cardWidth}px)`;
    };

    nextButton?.addEventListener('click', () => {
        currentIndex = Math.max(0, currentIndex - 1);
        updateCarousel();
    });
    prevButton?.addEventListener('click', () => {
        currentIndex += 1;
        updateCarousel();
    });
    addEventListener('resize', updateCarousel);
    updateCarousel();
}

// מפעילה את טופס כתיבת ההמלצה: הצגה למחוברים, מצב אנונימי ושליחה.
function initializeReviewForm() {
    if (getToken() && reviewFormSection) {
        reviewFormSection.style.display = 'block';
        if (nameInput) nameInput.value = getUser()?.fullName || localStorage.getItem('userName') || '';
    }

    if (anonymousCheckbox && nameInput) {
        let originalName = nameInput.value;
        anonymousCheckbox.addEventListener('change', () => {
            if (anonymousCheckbox.checked) {
                originalName = nameInput.value;
                nameInput.value = '';
                nameInput.disabled = true;
                nameInput.placeholder = 'יוצג כמשתמש/ת אנונימי/ת';
            } else {
                nameInput.disabled = false;
                nameInput.value = originalName || getUser()?.fullName || '';
                nameInput.placeholder = 'איך תרצי להופיע באתר?';
            }
        });
    }

    reviewForm?.addEventListener('submit', async event => {
        event.preventDefault();
        try {
            await submitReview({
                text: document.getElementById('review-text').value,
                name: nameInput?.value || '',
                isAnonymous: Boolean(anonymousCheckbox?.checked)
            });

            reviewForm.style.display = 'none';
            if (successMsg) successMsg.style.display = 'block';
            setTimeout(() => {
                if (successMsg) successMsg.style.display = 'none';
                reviewForm.reset();
                if (anonymousCheckbox) anonymousCheckbox.checked = false;
                if (nameInput) {
                    nameInput.disabled = false;
                    nameInput.value = getUser()?.fullName || '';
                }
                reviewForm.style.display = 'flex';
            }, 3500);
        } catch (error) {
            showMessage(error.message);
        }
    });
}
