const API_URL_WORKOUTS = `${window.API_BASE_URL}/api/workouts`;
const API_URL_TRACKING = `${window.API_BASE_URL}/api/tracking`;

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

    function hasWorkoutFinished(session) {

        const workoutDate =
            new Date(session.date);

        const dateKey =
            formatDateKey(workoutDate);

        const workoutDateTime =
            new Date(`${dateKey}T${session.time}`);

        return new Date() >= workoutDateTime;
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

    // אם אין אימונים ביום שנבחר
    if (!sessions.length) {
        const message = document.createElement('div');

        message.className = 'empty-session';
        message.textContent = 'אין שיעורים שנקבעו ליום זה במערכת';

        container.replaceChildren(message);

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

    // הכנת רשימת האימונים
    const fragment = document.createDocumentFragment();

    sessions.forEach(session => {

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

        // כרטיס האימון
        const item = document.createElement('div');
        item.className = 'session-item';

        // פרטי האימון
        const main = document.createElement('div');
        main.className = 'session-main';

        const time = document.createElement('span');
        time.className = 'session-time';
        time.textContent = session.time || '';

        const title = document.createElement('h4');
        title.className = 'session-title';
        title.textContent = session.title || '';

        const instructor = document.createElement('p');
        instructor.className = 'session-meta';
        instructor.textContent = `מדריך: ${session.instructor || ''}`;

        main.append(time, title, instructor);

        // אזור הפעולות
        const actions = document.createElement('div');
        actions.className = 'session-actions';

        const count = document.createElement('span');
        count.className = 'session-meta';
        count.textContent =
            `${registeredCount}/${session.maxParticipants} רשומים`;

        actions.appendChild(count);

        // יצירת כפתור
        function createActionButton(text, className, onClick, disabled = false) {
            const button = document.createElement('button');

            button.type = 'button';
            button.className = `session-action-btn ${className}`;
            button.textContent = text;
            button.disabled = disabled;

            if (onClick) {
                button.addEventListener('click', onClick);
            }

            return button;
        }

        // התאמת הכפתורים למצב האימון
        if (!userStr) {

            actions.appendChild(
                createActionButton(
                    'התחבר כדי להירשם',
                    'login',
                    () => {
                        window.location.href = 'login.html';
                    }
                )
            );

        } else if (isUserRegistered) {

            if (hasWorkoutFinished(session)) {

                const actionGroup = document.createElement('div');
                actionGroup.className = 'session-action-group';

                actionGroup.appendChild(
                    createActionButton(
                        'נרשמת בהצלחה',
                        'registered',
                        null,
                        true
                    )
                );

                actionGroup.appendChild(
                    createActionButton(
                        'סיימתי את האימון',
                        'complete',
                        () => window.completeWorkout(session._id)
                    )
                );

                actions.appendChild(actionGroup);

            } else {

                actions.appendChild(
                    createActionButton(
                        'נרשמת בהצלחה',
                        'registered',
                        null,
                        true
                    )
                );
            }

        } else if (isFull) {

            actions.appendChild(
                createActionButton(
                    'האימון מלא',
                    'full',
                    null,
                    true
                )
            );

        } else {

            actions.appendChild(
                createActionButton(
                    'הרשמה לשיעור',
                    'register',
                    () => window.registerForSession(session._id)
                )
            );
        }

        // הרכבת כרטיס האימון
        item.append(main, actions);

        fragment.appendChild(item);
    });

    // הצגת האימונים
    container.replaceChildren(fragment);
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
        grid.replaceChildren();

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

            dayBox.className = 'day-box';

            dayBox.innerText = i;

            const currentCellDate =
                new Date(year, month, i);

            // בדיקה האם זה היום שנבחר
            if (
                selectedDate.getFullYear() === currentCellDate.getFullYear() &&
                selectedDate.getMonth() === currentCellDate.getMonth() &&
                selectedDate.getDate() === currentCellDate.getDate()
            ) {

                dayBox.classList.add('selected');
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
    window.registerForSession = async function (workoutId) {

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

    window.completeWorkout = async function (workoutId) {

        const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        try {

            const response = await fetch(
                `${API_URL_TRACKING}/${workoutId}/complete`,
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
                    data.message || 'שגיאה בסימון האימון'
                );
            }

            if (typeof showModalMessage === 'function') {
                showModalMessage(
                    'האימון סומן כהושלם בהצלחה!'
                );
            }

            // עדכון רשימת האימונים
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