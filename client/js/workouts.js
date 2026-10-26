import { listWorkouts, registerForWorkout } from '../services/workouts.js';
import { completeWorkout } from '../services/tracking.js';
import { getToken, getUser } from '../shared/session.js';
import { showMessage } from '../shared/ui/modal.js';

const monthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];
const params = new URLSearchParams(location.search);
const selectedCategory = params.get('category');
const selectedType = params.get('type');
let currentDate = new Date();
let selectedDate = new Date();
let activeFilter = 'all';
let allWorkouts = [];

if (document.getElementById('days-grid')) {
    document.getElementById('prev-btn')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('next-btn')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    document.querySelectorAll('.workout-filter').forEach(button => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.filter;
            document.querySelectorAll('.workout-filter').forEach(filter =>
                filter.classList.toggle('active', filter === button)
            );
            renderSelectedDaySessions();
        });
    });
    renderCalendar();
    fetchWorkouts();
}

function formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function hasWorkoutFinished(workout) {
    const date = formatDateKey(new Date(workout.date));
    return new Date() >= new Date(`${date}T${workout.time}`);
}

async function fetchWorkouts() {
    try {
        allWorkouts = await listWorkouts();
        renderCalendar();
        renderSelectedDaySessions();
    } catch (error) {
        console.error('שגיאה בשליפת האימונים:', error);
        showMessage(error.message);
    }
}

function renderCalendar() {
    const grid = document.getElementById('days-grid');
    if (!grid) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const title = document.getElementById('cal-title');
    if (title) title.textContent = `${monthNames[month]} ${year}`;
    grid.replaceChildren();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let index = 0; index < firstDay; index++) {
        const empty = document.createElement('div');
        empty.className = 'day-box empty';
        grid.append(empty);
    }
    for (let day = 1; day <= totalDays; day++) {
        const dayBox = document.createElement('button');
        dayBox.type = 'button';
        dayBox.className = 'day-box';
        dayBox.textContent = day;
        const date = new Date(year, month, day);
        if (formatDateKey(date) === formatDateKey(selectedDate)) dayBox.classList.add('selected');
        dayBox.addEventListener('click', () => {
            selectedDate = date;
            renderCalendar();
            renderSelectedDaySessions();
        });
        grid.append(dayBox);
    }
}

function renderSelectedDaySessions() {
    const container = document.getElementById('selected-day-sessions');
    const heading = document.getElementById('selected-day-heading');
    if (!container) return;

    if (heading) {
        heading.textContent = `שיעורים ב-${selectedDate.getDate()} ב${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    }

    let sessions = allWorkouts.filter(workout =>
        formatDateKey(new Date(workout.date)) === formatDateKey(selectedDate)
    );
    if (selectedCategory) sessions = sessions.filter(workout => workout.category === selectedCategory);
    if (selectedType) sessions = sessions.filter(workout => workout.type === selectedType);
    if (activeFilter !== 'all') sessions = sessions.filter(workout => workout.type === activeFilter);

    if (!sessions.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-session';
        empty.textContent = 'אין שיעורים שנקבעו ליום זה במערכת';
        container.replaceChildren(empty);
        return;
    }

    const user = getUser();
    const userId = user?._id || user?.id;
    const isLoggedIn = Boolean(getToken());
    const fragment = document.createDocumentFragment();
    sessions.forEach(session => {
        const registeredUsers = session.registeredUsers || [];
        const isRegistered = Boolean(userId && registeredUsers.some(id => String(id) === String(userId)));
        const isFull = registeredUsers.length >= session.maxParticipants;
        const item = document.createElement('div');
        item.className = 'session-item';

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

        const actions = document.createElement('div');
        actions.className = 'session-actions';
        const count = document.createElement('span');
        count.className = 'session-meta';
        count.textContent = `${registeredUsers.length}/${session.maxParticipants} רשומים`;
        actions.append(count);

        if (!isLoggedIn) {
            actions.append(makeButton('התחבר כדי להירשם', 'login', () => { location.href = 'login.html'; }));
        } else if (isRegistered) {
            actions.append(makeButton('נרשמת בהצלחה', 'registered', null, true));
            if (hasWorkoutFinished(session)) {
                actions.append(makeButton('סיימתי את האימון', 'complete', () => completeSession(session._id)));
            }
        } else if (isFull) {
            actions.append(makeButton('האימון מלא', 'full', null, true));
        } else {
            actions.append(makeButton('הרשמה לשיעור', 'register', () => registerSession(session._id)));
        }
        item.append(main, actions);
        fragment.append(item);
    });
    container.replaceChildren(fragment);
}

function makeButton(text, className, onClick, disabled = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `session-action-btn ${className}`;
    button.textContent = text;
    button.disabled = disabled;
    if (onClick) button.addEventListener('click', onClick);
    return button;
}

async function registerSession(id) {
    if (!getToken()) {
        showMessage('עלייך להתחבר למערכת כדי להירשם לאימון.');
        return;
    }
    try {
        await registerForWorkout(id);
        showMessage('נרשמת לאימון בהצלחה!');
        await fetchWorkouts();
    } catch (error) {
        showMessage(error.message);
    }
}

async function completeSession(id) {
    if (!getToken()) {
        location.href = 'login.html';
        return;
    }
    try {
        await completeWorkout(id);
        showMessage('האימון סומן כהושלם בהצלחה!');
        await fetchWorkouts();
    } catch (error) {
        showMessage(error.message);
    }
}
