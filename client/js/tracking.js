import {
    addActivity,
    addWeight,
    getDashboard,
    getWeightHistory
} from '../services/tracking.js';
import { requireAuth } from '../shared/session.js';
import { showMessage } from '../shared/ui/modal.js';

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

const activityForm = document.getElementById('activity-form');
const weightForm = document.getElementById('weight-form');

activityForm?.addEventListener('submit', submitActivity);
weightForm?.addEventListener('submit', submitWeight);
loadTrackingDashboard();

async function loadTrackingDashboard() {
    if (!requireAuth()) return;
    try {
        updateDashboard(await getDashboard());
        await loadWeightHistory();
    } catch (error) {
        console.error('שגיאה בטעינת לוח המעקב:', error);
        showMessage(error.message);
    }
}

function updateDashboard(data) {
    setSignedNumber('weight-change', data.weightChange);
    setSignedNumber('prev-weight-diff', data.previousWeightDiff);
    setText('initial-weight', Number(data.initialWeight || 0).toFixed(1));
    setText('weigh-in-day', getHebrewDay(data.weighInDay));
    setText('weekly-food-calories', formatNumber(data.weeklyFoodCalories));
    setText('weekly-workout-calories', formatNumber(data.weeklyWorkoutCalories));
    setText('weekly-activity-calories', formatNumber(data.weeklyActivityCalories));
    setText('total-burned-calories', formatNumber(data.totalBurnedCalories));
    setText('calorie-balance', formatNumber(data.calorieBalance));

    const completedWorkouts = (data.history || []).map(record => ({
        activityType: record.workoutId?.category || 'studio',
        date: record.completedAt || record.createdAt,
        durationMinutes: record.durationMinutes || 60,
        caloriesBurned: record.caloriesBurned || 250,
        title: record.workoutId?.title || 'אימון סטודיו'
    }));
    const activities = [
        ...(data.activityHistory || []).map(activity => ({
            ...activity,
            title: ACTIVITY_NAMES[activity.activityType] || activity.activityType
        })),
        ...completedWorkouts
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    renderRecentActivities(activities);
}

function renderRecentActivities(activities) {
    const container = document.getElementById('activity-history');
    if (!container) return;
    const items = activities.slice(0, 4);

    if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-history-message';
        empty.textContent = 'עדיין לא נוספו פעילויות או אימונים.';
        container.replaceChildren(empty);
        return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-history-item';
        const details = document.createElement('div');
        details.className = 'activity-history-details';
        const icon = document.createElement('div');
        icon.className = 'activity-history-icon';
        icon.textContent = '🏃';
        const info = document.createElement('div');
        info.className = 'activity-history-info';
        const name = document.createElement('div');
        name.className = 'activity-history-name';
        name.textContent = activity.title || 'פעילות';
        const date = document.createElement('div');
        date.className = 'activity-history-date';
        date.textContent = `${activity.date ? new Date(activity.date).toLocaleDateString('he-IL') : ''} · ${Number(activity.durationMinutes || 0)} דק'`;
        info.append(name, date);
        details.append(icon, info);
        const calories = document.createElement('div');
        calories.className = 'activity-history-calories';
        calories.textContent = `${Number(activity.caloriesBurned || 0).toLocaleString('he-IL')} Kcal`;
        item.append(details, calories);
        fragment.append(item);
    });
    container.replaceChildren(fragment);
}

async function submitActivity(event) {
    event.preventDefault();
    const activityType = document.getElementById('activity-type').value;
    const durationMinutes = Number(document.getElementById('activity-duration').value);
    if (!activityType) return showMessage('יש לבחור סוג פעילות.');
    if (!durationMinutes || durationMinutes <= 0) return showMessage('יש להזין משך פעילות תקין.');

    await withSubmitState(event.currentTarget, 'שומר...', 'הוספת פעילות', async () => {
        await addActivity({ activityType, durationMinutes });
        if (activityForm) {
        activityForm.reset();
}        showMessage('הפעילות נוספה בהצלחה למאזן שלך!');
        await loadTrackingDashboard();
    });
}

async function submitWeight(event) {
    event.preventDefault();
    const input = document.getElementById('new-weight');
    const weight = Number(input.value);
    if (!weight || weight <= 0) return showMessage('יש להזין משקל תקין.');

    await withSubmitState(event.currentTarget, 'מעדכן...', 'עדכון משקל', async () => {
        await addWeight(weight);
        input.value = '';
        await loadTrackingDashboard();
        showMessage('המשקל עודכן בהצלחה!');
    });
}

async function withSubmitState(form, busyText, idleText, action) {
    const button = form.querySelector('button[type="submit"]');
    if (button) {
        button.disabled = true;
        button.textContent = busyText;
    }
    try {
        await action();
    } catch (error) {
        showMessage(error.message);
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = idleText;
        }
    }
}

async function loadWeightHistory() {
    const container = document.getElementById('weight-history');
    if (!container) return;
    try {
        const history = await getWeightHistory();
        if (!history.length) {
            const empty = document.createElement('div');
            empty.className = 'empty-history-message';
            empty.textContent = 'עדיין אין היסטוריית משקל.';
            container.replaceChildren(empty);
            return;
        }

        const fragment = document.createDocumentFragment();
        history.slice().reverse().forEach(record => {
            const item = document.createElement('div');
            item.className = 'weight-history-item';
            const date = document.createElement('span');
            date.className = 'weight-history-date';
            date.textContent = new Date(record.date).toLocaleDateString('he-IL');
            const weight = document.createElement('strong');
            weight.className = 'weight-history-value';
            weight.textContent = `${Number(record.weight).toFixed(1)} ק"ג`;
            item.append(date, weight);
            fragment.append(item);
        });
        container.replaceChildren(fragment);
    } catch (error) {
        const message = document.createElement('div');
        message.className = 'weight-history-error';
        message.textContent = error.message || 'לא ניתן לטעון היסטוריה.';
        container.replaceChildren(message);
    }
}

function setSignedNumber(id, value) {
    const number = Number(value || 0);
    const formatted = Math.abs(number).toFixed(1);
    setText(id, number > 0 ? `+${formatted}` : number < 0 ? `-${formatted}` : '0.0');
}

function getHebrewDay(day) {
    return ({
        sunday: 'ראשון', monday: 'שני', tuesday: 'שלישי',
        wednesday: 'רביעי', thursday: 'חמישי', friday: 'שישי', saturday: 'שבת'
    })[day] || '-';
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString('he-IL');
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}
