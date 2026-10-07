document.addEventListener('DOMContentLoaded', () => {
    const reviewsContainer = document.getElementById('reviews-container');
    const reviewFormSection = document.getElementById('review-form-section');
    const reviewForm = document.getElementById('review-form');
    const nameInput = document.getElementById('review-name');
    const anonymousCheckbox = document.getElementById('anonymous-checkbox');
    const successMsg = document.getElementById('review-success-msg');
    
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const wrapper = document.getElementById('carousel-wrapper');
    let currentIndex = 0;

    // המלצות לדוגמה כדי שהגלגלת תופיע מיד ותציג תוכן חי ועשיר
    const dummyReviews = [
        { text: "האתר הזה פשוט שינה לי את החיים! התוכניות אימון והמעקב אחרי תזונה נתנו לי את כל הכלים להצליח.", name: "דנה כהן" },
        { text: "התמיכה והמעקב באתר מדהימים. ממליצה בחום לכל מי שרוצה לעשות שינוי אמיתי ואורח חיים בריא.", name: "מיכל לוי" },
        { text: "תוכניות כושר ברמה גבוהה מאוד ומותאמות אישית. מרגישים את ההשקעה בכל פרט ופרט באתר!", name: "אביה רחמים" },
        { text: "התוצאות לא איחרו להגיע! מסגרת מדהימה שנותנת מוטיבציה כל יום מחדש.", name: "תהילה ש." }
    ];

    // שליפת המלצות מאושרות מהשרת ושילובן עם ההמלצות לדוגמה
    async function loadReviews() {
        try {
            const response = await fetch('http://localhost:5000/api/reviews/approved');
            let serverReviews = [];
            if (response.ok) {
                serverReviews = await response.json();
            }
            
            const allReviews = [...serverReviews, ...dummyReviews];

            reviewsContainer.innerHTML = allReviews.map(review => `
                <div class="review-item-card">
                    <p>"${review.text}"</p>
                    <div class="review-item-footer">
                        <div class="review-item-avatar">
                            ${review.name.charAt(0)}
                        </div>
                        <h4 class="review-item-name">${review.name}</h4>
                    </div>
                </div>
            `).join('');

            setupCarousel();
        } catch (error) {
            reviewsContainer.innerHTML = dummyReviews.map(review => `
                <div class="review-item-card">
                    <p>"${review.text}"</p>
                    <div class="review-item-footer">
                        <div class="review-item-avatar">
                            ${review.name.charAt(0)}
                        </div>
                        <h4 class="review-item-name">${review.name}</h4>
                    </div>
                </div>
            `).join('');
            setupCarousel();
        }
    }

    // מנגנון ניווט דינמי בגלגלת (מתאים את עצמו בדיוק לרוחב 3 כרטיסיות)
    function setupCarousel() {
        const cards = reviewsContainer.children;
        if (cards.length === 0) return;

        function updateCarousel() {
            // חישוב דינמי של רוחב הכרטיס כולל המרווח (Gap)
            const cardWidth = cards[0].offsetWidth + 20; 
            const maxVisible = Math.floor(wrapper.offsetWidth / cardWidth);
            const maxIndex = cards.length - Math.max(1, maxVisible);

            if (currentIndex < 0) currentIndex = 0;
            if (currentIndex > maxIndex) currentIndex = maxIndex > 0 ? maxIndex : 0;

            reviewsContainer.style.transform = `translateX(${currentIndex * cardWidth}px)`;
        }

        if(nextBtn) {
            nextBtn.onclick = () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateCarousel();
                }
            };
        }
        if(prevBtn) {
            prevBtn.onclick = () => {
                const cardWidth = cards[0].offsetWidth + 20;
                const maxVisible = Math.floor(wrapper.offsetWidth / cardWidth);
                const maxIndex = cards.length - Math.max(1, maxVisible);
                if (currentIndex < maxIndex) {
                    currentIndex++;
                    updateCarousel();
                }
            };
        }
    }

    loadReviews();

    // ניהול תצוגת הטופס (רק למשתמשים מחוברים שיש להם טוקן)
    const token = localStorage.getItem('token');
    if (token && reviewFormSection) {
        reviewFormSection.style.display = 'block';
        let storedName = localStorage.getItem('userName') || localStorage.getItem('name') || '';
        if (nameInput) nameInput.value = storedName;
    }

    // טיפול בסימון "אנונימי"
    if (anonymousCheckbox && nameInput) {
        let originalName = nameInput.value;
        anonymousCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                originalName = nameInput.value;
                nameInput.value = '';
                nameInput.disabled = true;
                nameInput.placeholder = 'יוצג כמשתמש/ת אנונימי/ת';
            } else {
                nameInput.disabled = false;
                nameInput.value = originalName || localStorage.getItem('userName') || '';
                nameInput.placeholder = 'איך תרצי להופיע באתר?';
            }
        });
    }

    // שליחת הטופס לשרת
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = document.getElementById('review-text').value;
            const isAnonymous = anonymousCheckbox.checked;
            const name = nameInput.value;

            try {
                const response = await fetch('http://localhost:5000/api/reviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ text, name, isAnonymous })
                });

                if (response.ok) {
                    reviewForm.style.display = 'none';
                    successMsg.style.display = 'block';

                    // חזרה לטופס נקי לאחר 3.5 שניות
                    setTimeout(() => {
                        successMsg.style.display = 'none';
                        reviewForm.reset();
                        if (anonymousCheckbox) anonymousCheckbox.checked = false;
                        if (nameInput) {
                            nameInput.disabled = false;
                            nameInput.value = localStorage.getItem('userName') || '';
                        }
                        reviewForm.style.display = 'flex';
                    }, 3500);
                } else {
                    const data = await response.json();
                    alert(`שגיאה: ${data.message || 'שליחת ההמלצה נכשלה.'}`);
                }
            } catch (error) {
                alert('שגיאת תקשורת מול השרת.');
            }
        });
    }
});