console.log("🚀 קובץ tracking.js נטען ומוכן לפעולה!");

const API_URL = 'http://localhost:5000/api';

const ACTIVITY_NAMES = {
    walking: 'הליכה',
    running: 'ריצה',
    stairs: 'מדרגות',
    cycling: 'רכיבה על אופניים',
    homeWorkout: 'אימון ביתי',
    studio: 'אימון סטודיו',
    zoom: 'אימון זום',
    other: 'פעילות אחרת'
};

function getToken() {
    return localStorage.getItem('token');
}

async function apiRequest(url, options = {}) {
    const token = getToken();
    const headers = { ...(options.headers || {}) };

    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

    const response = await fetch(url, { ...options, headers });
    let data = null;
    
    try { data = await response.json(); } 
    catch { data = {}; }

    if (!response.ok) {
        throw new Error(data.message || `שגיאה מהשרת (${response.status})`);
    }
    return data;
}

function checkLogin() {
    if (!getToken()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

async function loadTrackingDashboard() {
    if (!checkLogin()) return;
    try {
        const data = await apiRequest(`${API_URL}/tracking`);
        updateDashboard(data);
        loadWeightHistory();
    } catch (error) {
        console.error('שגיאה בטעינת לוח המעקב:', error);
    }
}

function updateDashboard(data) {
    // 1. עדכון ההפרש מהמשקל ההתחלתי
    const weightChange = Number(data.weightChange || 0);
    const weightElement = document.getElementById('weight-change');

    if (weightElement) {
        const formatted = Math.abs(weightChange).toFixed(1);
        if (weightChange > 0) weightElement.textContent = `+${formatted}`;
        else if (weightChange < 0) weightElement.textContent = `-${formatted}`;
        else weightElement.textContent = '0.0';
    }

    // 2. עדכון ההפרש מהשקילה הקודמת (בתיבה הבולטת החדשה)
    const prevDiffVal = Number(data.previousWeightDiff || 0);
    const prevDiffElement = document.getElementById('prev-weight-diff');

    if (prevDiffElement) {
        const prevFormatted = Math.abs(prevDiffVal).toFixed(1);
        if (prevDiffVal > 0) prevDiffElement.textContent = `+${prevFormatted}`;
        else if (prevDiffVal < 0) prevDiffElement.textContent = `-${prevFormatted}`;
        else prevDiffElement.textContent = '0.0';
    }

    setText('initial-weight', Number(data.initialWeight || 0).toFixed(1));
    setText('weigh-in-day', getHebrewDay(data.weighInDay));
    setText('weekly-food-calories', formatNumber(data.weeklyFoodCalories));
    setText('weekly-workout-calories', formatNumber(data.weeklyWorkoutCalories));
    setText('weekly-activity-calories', formatNumber(data.weeklyActivityCalories));
    setText('total-burned-calories', formatNumber(data.totalBurnedCalories));
    setText('calorie-balance', formatNumber(data.calorieBalance));

    // הצגת היסטוריית פעילויות מאוחדת (פעילויות עצמאיות + אימוני סטודיו/זום שהושלמו)
    const completedWorkoutsList = (data.history || []).map(h => ({
        activityType: h.workoutId?.category || 'studio',
        date: h.completedAt || h.createdAt,
        durationMinutes: h.durationMinutes || 60,
        caloriesBurned: h.caloriesBurned || 250,
        title: h.workoutId?.title || 'אימון סטודיו'
    }));

    const combinedActivities = [
        ...(data.activityHistory || []).map(a => ({ ...a, title: ACTIVITY_NAMES[a.activityType] || a.activityType })),
        ...completedWorkoutsList
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    renderRecentActivities(combinedActivities);
}

function renderRecentActivities(activities) {
    const container = document.getElementById('activity-history');
    if (!container) return;

    const lastFour = activities.slice(0, 4);
    if (!lastFour.length) {
        container.innerHTML = `<div class="text-gray-500 text-sm">עדיין לא נוספו פעילויות או אימונים.</div>`;
        return;
    }

    container.innerHTML = lastFour.map(activity => {
        const name = activity.title || 'פעילות';
        const date = activity.date ? new Date(activity.date).toLocaleDateString('he-IL') : '';
        const calories = Number(activity.caloriesBurned || 0);
        return `
            <div class="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-[#E8F5F1] text-[#1E4630] flex items-center justify-center">🏃</div>
                    <div>
                        <div class="font-bold text-[#1E4630] text-sm">${escapeHtml(name)}</div>
                        <div class="text-xs text-gray-400">${escapeHtml(date)} · ${Number(activity.durationMinutes || 0)} דק'</div>
                    </div>
                </div>
                <div class="font-bold text-gray-600 text-sm">${calories.toLocaleString('he-IL')} Kcal</div>
            </div>`;
    }).join('');
}

// הוספת פעילות עצמאית
async function addActivity(event) {
    event.preventDefault();

    const activityType = document.getElementById('activity-type').value;
    const durationMinutes = Number(document.getElementById('activity-duration').value);

    if (!activityType) return alert('יש לבחור סוג פעילות.');
    if (!durationMinutes || durationMinutes <= 0) return alert('יש להזין משך פעילות תקין.');

    const button = event.target.querySelector('button[type="submit"]');
    try {
        if (button) { button.disabled = true; button.textContent = 'שומר...'; }

        await apiRequest(`${API_URL}/activities`, {
            method: 'POST',
            body: JSON.stringify({ activityType, durationMinutes })
        });

        alert('הפעילות נוספה בהצלחה למאזן שלך!');
        document.getElementById('activity-form').reset();
        await loadTrackingDashboard(); 

    } catch (error) {
        alert(error.message || 'שגיאה בהוספת הפעילות.');
    } finally {
        if (button) { button.disabled = false; button.textContent = 'הוספת פעילות'; }
    }
}

// עדכון משקל
async function addWeight(event) {
    event.preventDefault();

    const input = document.getElementById('new-weight');
    const weight = Number(input.value);

    if (!weight || weight <= 0) return alert('יש להזין משקל תקין.');

    const button = event.target.querySelector('button[type="submit"]');
    try {
        if (button) { button.disabled = true; button.textContent = 'מעדכן...'; }

        await apiRequest(`${API_URL}/weight`, {
            method: 'POST',
            body: JSON.stringify({ weight })
        });

        input.value = '';
        await loadTrackingDashboard();
        alert('המשקל עודכן בהצלחה!');

    } catch (error) {
        alert(error.message || 'שגיאה בעדכון המשקל.');
    } finally {
        if (button) { button.disabled = false; button.textContent = 'עדכון משקל'; }
    }
}

async function loadWeightHistory() {
    const container = document.getElementById('weight-history');
    if (!container) return;

    try {
        const history = await apiRequest(`${API_URL}/weight/history`);
        if (!history.length) {
            container.innerHTML = `<div class="text-gray-500 text-sm">עדיין אין היסטוריית משקל.</div>`;
            return;
        }

        container.innerHTML = history.slice().reverse().map(record => {
            const date = new Date(record.date).toLocaleDateString('he-IL');
            return `
                <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span class="text-gray-500 text-sm">${escapeHtml(date)}</span>
                    <strong class="text-[#1E4630]">${Number(record.weight).toFixed(1)} ק"ג</strong>
                </div>`;
        }).join('');
    } catch (error) {
        container.innerHTML = `<div class="text-red-500 text-sm">לא ניתן לטעון היסטוריה.</div>`;
    }
}

function getHebrewDay(day) {
    const days = { sunday: 'ראשון', monday: 'שני', tuesday: 'שלישי', wednesday: 'רביעי', thursday: 'חמישי', friday: 'שישי', saturday: 'שבת' };
    return days[day] || '-';
}

function formatNumber(value) { return Number(value || 0).toLocaleString('he-IL'); }
function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }
function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
function logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = 'login.html'; }

document.addEventListener('DOMContentLoaded', () => {
    const activityForm = document.getElementById('activity-form');
    const weightForm = document.getElementById('weight-form');
    const logoutButton = document.getElementById('logout-button');

    if (activityForm) activityForm.addEventListener('submit', addActivity);
    if (weightForm) weightForm.addEventListener('submit', addWeight);
    if (logoutButton) logoutButton.addEventListener('click', logout);

    loadTrackingDashboard();
});