import { API_BASE_URL } from '../shared/config.js';
import { analyzeMeal, listMeals } from '../services/nutrition.js';
import { requireAuth } from '../shared/session.js';
import { showMessage } from '../shared/ui/modal.js';

let allMeals = [];

const mealForm = document.getElementById('meal-form');
const dateInput = document.getElementById('meal-date');

if (mealForm && requireAuth()) {
    if (dateInput) dateInput.value = getLocalDate();
    mealForm.addEventListener('submit', addMeal);
    loadMeals();
}

function getLocalDate() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

async function loadMeals() {
    try {
        allMeals = await listMeals();
        displayMeals(getTodayMeals(allMeals));
        displayHistory(getHistoryMeals(allMeals));
    } catch (error) {
        console.error('שגיאה בשליפת הארוחות:', error);
        showMessage(error.message);
    }
}

function isToday(meal) {
    const date = new Date(meal.date);
    const today = new Date();
    return date.getDate() === today.getDate()
        && date.getMonth() === today.getMonth()
        && date.getFullYear() === today.getFullYear();
}

function getTodayMeals(meals) {
    return meals.filter(isToday);
}

function getHistoryMeals(meals) {
    return meals.filter(meal => !isToday(meal));
}

async function addMeal(event) {
    event.preventDefault();
    const mealName = document.getElementById('meal-name').value.trim();
    const imageInput = document.getElementById('meal-image');

    if (!mealName) return showMessage('אנא כתוב את שם הארוחה.');
    if (!imageInput?.files?.length) return showMessage('אנא העלה תמונה של הארוחה.');

    const submitButton = mealForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    const formData = new FormData();
    formData.append('mealName', mealName);
    formData.append('date', dateInput.value);
    formData.append('image', imageInput.files[0]);
    submitButton.disabled = true;
    submitButton.textContent = 'מנתח את הארוחה...';

    try {
        const data = await analyzeMeal(formData);
        allMeals.push(data.meal);
        displayMeals(getTodayMeals(allMeals));
        displayHistory(getHistoryMeals(allMeals));
        if (mealForm) {
        mealForm.reset();
}        dateInput.value = getLocalDate();
        showMessage('הארוחה נוספה בהצלחה!');
    } catch (error) {
        console.error('שגיאה בהוספת הארוחה:', error);
        showMessage(error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

function createMealCard(meal) {
    const item = document.createElement('div');
    item.className = 'meal-card';
    const details = document.createElement('details');
    details.className = 'meal-details';
    const summary = document.createElement('summary');
    summary.className = 'meal-summary';
    const summaryRow = document.createElement('div');
    summaryRow.className = 'meal-summary-row';
    const summaryInfo = document.createElement('div');
    summaryInfo.className = 'meal-summary-info';

    const title = document.createElement('h3');
    title.className = 'meal-name-title';
    title.textContent = meal.mealName ?? '';
    const date = document.createElement('p');
    date.className = 'meal-date';
    date.textContent = formatDate(meal.date);
    summaryInfo.append(title, date);

    const calories = Number(meal.calories) || 0;
    const calorieLabel = document.createElement('span');
    calorieLabel.className = 'meal-calories';
    calorieLabel.textContent = `${calories} Kcal`;
    summaryRow.append(summaryInfo, calorieLabel);
    summary.append(summaryRow);

    const content = document.createElement('div');
    content.className = 'meal-details-content';
    if (meal.imageUrl) {
    const imageUrl = new URL(meal.imageUrl, window.location.origin);
    if (imageUrl.origin === window.location.origin) {
            const image = document.createElement('img');
            image.className = 'meal-image';
            image.alt = meal.mealName ?? '';
            image.src = imageUrl.href;
            content.append(image);
        }
    }

    const values = document.createElement('div');
    values.className = 'nutrition-values';
    [
        { label: 'קלוריות', value: calories, unit: ' Kcal' },
        { label: 'חלבון', value: Number(meal.protein) || 0, unit: 'g' },
        { label: 'פחמימות', value: Number(meal.carbs) || 0, unit: 'g' },
        { label: 'שומנים', value: Number(meal.fats) || 0, unit: 'g' }
    ].forEach(entry => {
        const card = document.createElement('div');
        card.className = 'nutrition-value-card';
        const label = document.createElement('p');
        label.className = 'nutrition-label';
        label.textContent = entry.label;
        const value = document.createElement('p');
        value.className = 'nutrition-value';
        value.textContent = `${entry.value}${entry.unit}`;
        card.append(label, value);
        values.append(card);
    });
    content.append(values);
    details.append(summary, content);
    item.append(details);
    return item;
}

function displayMeals(meals) {
    const container = document.getElementById('meals-list');
    if (!container) return;
    container.replaceChildren();

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;
    meals.forEach(meal => {
        calories += Number(meal.calories) || 0;
        protein += Number(meal.protein) || 0;
        carbs += Number(meal.carbs) || 0;
        fats += Number(meal.fats) || 0;
        container.append(createMealCard(meal));
    });

    if (!meals.length) {
        const empty = document.createElement('p');
        empty.className = 'empty-meals-message';
        empty.textContent = 'עדיין לא נוספו ארוחות.';
        container.append(empty);
    }

    const totalCalories = document.getElementById('total-calories');
    if (totalCalories) totalCalories.textContent = `${calories.toLocaleString()} Kcal`;
    setText('summary-calories', calories.toLocaleString());
    setText('summary-protein', `${protein}g`);
    setText('summary-carbs', `${carbs}g`);
    setText('summary-fats', `${fats}g`);
}

function displayHistory(meals) {
    const container = document.getElementById('history-list');
    if (!container) return;
    container.replaceChildren();

    if (!meals.length) {
        const empty = document.createElement('p');
        empty.className = 'empty-meals-message';
        empty.textContent = 'אין עדיין היסטוריית ארוחות.';
        container.append(empty);
        return;
    }

    meals.sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(meal => container.append(createMealCard(meal)));
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function formatDate(value) {
    return value ? new Date(value).toLocaleDateString('he-IL') : '';
}
