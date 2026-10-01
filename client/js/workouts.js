const API_URL_WORKOUTS = 'http://localhost:5000/api/workouts';

document.addEventListener("DOMContentLoaded", () => {

    let currentDate = new Date();
    let selectedDate = new Date();
    let activeFilter = "all";
    let allWorkouts = [];

    const urlParams = new URLSearchParams(window.location.search);

    const selectedCategory = urlParams.get('category');
    const selectedType = urlParams.get('type');

    // שמות החודשים להצגה בכותרת
    const monthNames = [
        "ינואר",
        "פברואר",
        "מרץ",
        "אפריל",
        "מאי",
        "יוני",
        "יולי",
        "אוגוסט",
        "ספטמבר",
        "אוקטובר",
        "נובמבר",
        "דצמבר"
    ];

    // הופך תאריך לפורמט YYYY-MM-DD
    function formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    // שליפת האימונים מהשרת
    async function fetchWorkouts() {
        try {
            const response = await fetch(API_URL_WORKOUTS);

            if (!response.ok) {
                throw new Error('שגיאה בשליפת הנתונים');
            }

            const data = await response.json();

            allWorkouts = data;

            renderCalendar();
            renderSelectedDaySessions();

        } catch (error) {
            console.error('שגיאה בשליפת האימונים:', error);
        }
    }

    // מחזיר את כל האימונים של תאריך מסוים
    function getSessionsForDate(date) {

        const dateString = formatDateKey(date);

        return allWorkouts.filter(workout => {

            const workoutDate = new Date(workout.date);

            return formatDateKey(workoutDate) === dateString;
        });
    }

    // הצגת האימונים של היום שנבחר
    function renderSelectedDaySessions() {

        const container = document.getElementById('selected-day-sessions');
        const heading = document.getElementById('selected-day-heading');

        if (!container) return;

        // עדכון הכותרת של היום
        if (heading) {
            const day = selectedDate.getDate();
            const month = monthNames[selectedDate.getMonth()];
            const year = selectedDate.getFullYear();

            heading.textContent = `שיעורים ב-${day} ב${month} ${year}`;
        }

        let sessions = getSessionsForDate(selectedDate);

        if (selectedCategory) {
            sessions = sessions.filter(session => {
              return session.category === selectedCategory;
         });
        }

        if (selectedType) {
         sessions = sessions.filter(session => {
             return session.type === selectedType;
                    });
        }

        // סינון לפי סטודיו / זום
        if (activeFilter !== "all") {
            sessions = sessions.filter(session => {
                return session.type === activeFilter;
            });
        }

        // אם אין אימונים
        if (!sessions.length) {

            container.innerHTML = `
                <div class="p-4 text-center text-gray-500 text-xs">
                    אין שיעורים שנקבעו ליום זה במערכת
                </div>
            `;

            return;
        }

        const userStr = localStorage.getItem('user');

        let currentUserId = null;

        if (userStr) {
            try {
                currentUserId = JSON.parse(userStr).id;
            } catch (error) {
                console.error('שגיאה בקריאת פרטי המשתמש:', error);
            }
        }

        container.innerHTML = sessions.map(session => {

            const registeredCount = session.registeredUsers
                ? session.registeredUsers.length
                : 0;

            const isFull =
                registeredCount >= session.maxParticipants;

            // בדיקה האם המשתמש כבר רשום
            const isUserRegistered =
                session.registeredUsers &&
                currentUserId &&
                session.registeredUsers.some(id =>
                    String(id) === String(currentUserId)
                );

            let actionBtn = '';

            // המשתמש לא מחובר
            if (!userStr) {

                actionBtn = `
                    <button
                        onclick="window.location.href='login.html'"
                        class="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-300">
                        התחבר כדי להירשם
                    </button>
                `;

            // המשתמש כבר רשום
            } else if (isUserRegistered) {

                actionBtn = `
                    <button
                        class="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold"
                        disabled>
                        נרשמת בהצלחה
                    </button>
                `;

            // האימון מלא
            } else if (isFull) {

                actionBtn = `
                    <button
                        class="px-3 py-1.5 bg-gray-300 text-gray-600 rounded-xl text-xs font-semibold"
                        disabled>
                        האימון מלא
                    </button>
                `;

            // אפשר להירשם
            } else {

                actionBtn = `
                    <button
                        onclick="registerForSession('${session._id}')"
                        class="px-3 py-1.5 bg-[#1E4630] text-white rounded-xl text-xs font-semibold hover:bg-[#163524]">
                        הרשמה לשיעור
                    </button>
                `;
            }

            return `
                <div class="p-4 bg-white rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">

                    <div>
                        <span class="text-xs font-bold text-[#1E4630]">
                            ${session.time}
                        </span>

                        <h4 class="font-bold text-gray-800 text-sm">
                            ${session.title}
                        </h4>

                        <p class="text-xs text-gray-500">
                            מדריך: ${session.instructor}
                        </p>
                    </div>

                    <div class="flex items-center gap-3">

                        <span class="text-xs text-gray-500">
                            ${registeredCount}/${session.maxParticipants} רשומים
                        </span>

                        ${actionBtn}

                    </div>

                </div>
            `;
        }).join('');
    }

    // מעבר לחודש הקודם
    document.getElementById('prev-btn').addEventListener('click', () => {

        currentDate.setMonth(currentDate.getMonth() - 1);

        renderCalendar();
    });

    // מעבר לחודש הבא
    document.getElementById('next-btn').addEventListener('click', () => {

        currentDate.setMonth(currentDate.getMonth() + 1);

        renderCalendar();
    });

    // ציור לוח השנה
    function renderCalendar() {

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const grid = document.getElementById('days-grid');
        const title = document.getElementById('cal-title');

        if (!grid) return;

        // עדכון כותרת החודש
        if (title) {
            title.textContent = `${monthNames[month]} ${year}`;
        }

        // ניקוי הלוח
        grid.innerHTML = '';

        // באיזה יום בשבוע מתחיל החודש
        const firstDay = new Date(year, month, 1).getDay();

        // כמה ימים יש בחודש
        const totalDays = new Date(year, month + 1, 0).getDate();

        // תאים ריקים לפני היום הראשון
        for (let i = 0; i < firstDay; i++) {

            const emptyBox = document.createElement('div');

            emptyBox.className = 'day-box empty';

            grid.appendChild(emptyBox);
        }

        // יצירת הימים
        for (let i = 1; i <= totalDays; i++) {

            const dayBox = document.createElement('div');

            dayBox.className =
                'day-box p-2 text-center rounded-xl cursor-pointer hover:bg-gray-100 text-xs font-semibold';

            dayBox.innerText = i;

            const currentCellDate =
                new Date(year, month, i);

            // בדיקה האם זה היום שנבחר
            if (
                selectedDate.getFullYear() === currentCellDate.getFullYear() &&
                selectedDate.getMonth() === currentCellDate.getMonth() &&
                selectedDate.getDate() === currentCellDate.getDate()
            ) {

                dayBox.classList.add(
                    'bg-[#1E4630]',
                    'text-white'
                );
            }

            // לחיצה על יום
            dayBox.addEventListener('click', () => {

                selectedDate = new Date(
                    year,
                    month,
                    i
                );

                renderCalendar();
                renderSelectedDaySessions();
            });

            grid.appendChild(dayBox);
        }
    }

    // כפתורי הסינון
    const filterButtons =
        document.querySelectorAll('.workout-filter');

    filterButtons.forEach(button => {

        button.addEventListener('click', () => {

            // שמירת הסינון שנבחר
            activeFilter = button.dataset.filter;

            // הסרת active מכל הכפתורים
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // הוספת active לכפתור שנלחץ
            button.classList.add('active');

            // הצגת האימונים מחדש
            renderSelectedDaySessions();
        });
    });

    // הרשמה לאימון
    window.registerForSession = async function(workoutId) {

        const token = localStorage.getItem('token');

        if (!token) {

            if (typeof showModalMessage === 'function') {
                showModalMessage('עלייך להתחבר למערכת כדי להירשם לאימון.');
            }

            window.location.href = 'login.html';

            return;
        }

        try {

            const response = await fetch(
                `${API_URL_WORKOUTS}/${workoutId}/register`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'שגיאה בהרשמה'
                );
            }

            if (typeof showModalMessage === 'function') {
                showModalMessage('נרשמת לאימון בהצלחה!');
            }

            // שליפת הנתונים מחדש
            fetchWorkouts();

        } catch (error) {

            if (typeof showModalMessage === 'function') {
                showModalMessage(error.message);
            } else {
                alert(error.message);
            }
        }
    };

    // הפעלה ראשונית
    fetchWorkouts();
});