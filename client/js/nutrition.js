const API_URL_NUTRITION = `${window.API_BASE_URL}/api/nutrition`;
const API_URL_NUTRITION_ANALYZE = `${API_URL_NUTRITION}/analyze`;

let todayMeals = [];
let allMeals = [];

// מחזיר את התאריך המקומי של היום
function getLocalDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

document.addEventListener('DOMContentLoaded', () => {

    loadMeals();

    const mealForm = document.getElementById('meal-form');

    if (mealForm) {
        mealForm.addEventListener('submit', addMeal);
    }

    const dateInput = document.getElementById('meal-date');

    if (dateInput) {
        dateInput.value = getLocalDate();
    }
});

// שליפת הארוחות של המשתמש המחובר
async function loadMeals() {

    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {

        const response = await window.apiFetch(API_URL_NUTRITION, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'שגיאה בשליפת הארוחות');
        }

        allMeals = data;

        todayMeals = getTodayMeals(allMeals);

        displayMeals(todayMeals);
        displayHistory(getHistoryMeals(allMeals));

    } catch (error) {

        console.error('שגיאה בשליפת הארוחות:', error);
        showCustomMessageBox(error.message);
    }
}

// מחזיר את הארוחות של היום
function getTodayMeals(meals) {

    const today = new Date();

    return meals.filter(meal => {

        const mealDate = new Date(meal.date);

        return (
            mealDate.getDate() === today.getDate() &&
            mealDate.getMonth() === today.getMonth() &&
            mealDate.getFullYear() === today.getFullYear()
        );
    });
}

// מחזיר את הארוחות שאינן מהיום
function getHistoryMeals(meals) {

    const today = new Date();

    return meals.filter(meal => {

        const mealDate = new Date(meal.date);

        return !(
            mealDate.getDate() === today.getDate() &&
            mealDate.getMonth() === today.getMonth() &&
            mealDate.getFullYear() === today.getFullYear()
        );
    });
}

// הוספת ארוחה
async function addMeal(event) {

    event.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const mealName = document.getElementById('meal-name').value.trim();
    const date = document.getElementById('meal-date').value;
    const imageInput = document.getElementById('meal-image');

    if (!mealName) {
        showCustomMessageBox('אנא כתוב את שם הארוחה.');
        return;
    }

    if (!imageInput || imageInput.files.length === 0) {
        showCustomMessageBox('אנא העלה תמונה של הארוחה.');
        return;
    }

    const submitButton = document.querySelector(
        '#meal-form button[type="submit"]'
    );

    const originalButtonText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = 'מנתח את הארוחה...';

    const formData = new FormData();

    formData.append('mealName', mealName);
    formData.append('date', date);
    formData.append('image', imageInput.files[0]);

    try {

        const response = await window.apiFetch(API_URL_NUTRITION_ANALYZE, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'שגיאה בהוספת הארוחה');
        }

        showCustomMessageBox('הארוחה נוספה בהצלחה!');

        allMeals.push(data.meal);

        todayMeals = getTodayMeals(allMeals);

        displayMeals(todayMeals);
        displayHistory(getHistoryMeals(allMeals));

        // איפוס הטופס
        document.getElementById('meal-form').reset();

        document.getElementById('meal-date').value = getLocalDate();

    } catch (error) {

        console.error('שגיאה בהוספת הארוחה:', error);
        showCustomMessageBox(error.message);

    } finally {

        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

// יצירת כרטיס ארוחה בצורה בטוחה
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

    const mealName = document.createElement('h3');
    mealName.className = 'meal-name-title';
    mealName.textContent = meal.mealName ?? '';

    const mealDate = document.createElement('p');
    mealDate.className = 'meal-date';
    mealDate.textContent = formatDate(meal.date);

    summaryInfo.append(mealName, mealDate);

    const calories = Number(meal.calories) || 0;

    const mealCalories = document.createElement('span');
    mealCalories.className = 'meal-calories';
    mealCalories.textContent = `${calories} Kcal`;

    summaryRow.append(summaryInfo, mealCalories);
    summary.appendChild(summaryRow);

    const detailsContent = document.createElement('div');
    detailsContent.className = 'meal-details-content';

    // הוספת תמונה, אם קיימת
    if (meal.imageUrl) {
        const image = document.createElement('img');

        image.className = 'meal-image';
        image.alt = meal.mealName ?? '';

        // קבלת כתובת התמונה מהשרת
        const imageUrl = new URL(
            meal.imageUrl,
            window.API_BASE_URL
        );

        // הצגת תמונות רק מאותו מקור של השרת
        if (imageUrl.origin === new URL(window.API_BASE_URL).origin) {
            image.src = imageUrl.href;
            detailsContent.appendChild(image);
        }
    }

    const nutritionValues = document.createElement('div');
    nutritionValues.className = 'nutrition-values';

    const nutritionItems = [
        { label: 'קלוריות', value: calories, unit: ' Kcal' },
        { label: 'חלבון', value: Number(meal.protein) || 0, unit: 'g' },
        { label: 'פחמימות', value: Number(meal.carbs) || 0, unit: 'g' },
        { label: 'שומנים', value: Number(meal.fats) || 0, unit: 'g' }
    ];

    nutritionItems.forEach(nutritionItem => {
        const card = document.createElement('div');
        card.className = 'nutrition-value-card';

        const label = document.createElement('p');
        label.className = 'nutrition-label';
        label.textContent = nutritionItem.label;

        const value = document.createElement('p');
        value.className = 'nutrition-value';
        value.textContent = `${nutritionItem.value}${nutritionItem.unit}`;

        card.append(label, value);
        nutritionValues.appendChild(card);
    });

    detailsContent.appendChild(nutritionValues);

    details.append(summary, detailsContent);
    item.appendChild(details);

    return item;
}
// הצגת הארוחות של היום
function displayMeals(meals) {

    const container = document.getElementById('meals-list');
    const totalCaloriesElement = document.getElementById('total-calories');

    if (!container) return;

    container.replaceChildren();
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    if (meals.length === 0) {

        container.appendChild(createNoMealsMessage());

        updateNutritionSummary(0, 0, 0, 0);

        if (totalCaloriesElement) {
            totalCaloriesElement.textContent = '0 Kcal';
        }

        return;
    }

    meals.forEach(meal => {

        totalCalories += Number(meal.calories) || 0;
        totalProtein += Number(meal.protein) || 0;
        totalCarbs += Number(meal.carbs) || 0;
        totalFats += Number(meal.fats) || 0;

        container.appendChild(createMealCard(meal));
    });

    if (totalCaloriesElement) {
        totalCaloriesElement.textContent =
            `${totalCalories.toLocaleString()} Kcal`;
    }

    updateNutritionSummary(
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats
    );
}

// הצגת היסטוריית הארוחות
function displayHistory(meals) {

    const container = document.getElementById('history-list');

    if (!container) return;

    container.replaceChildren(); if (meals.length === 0) {

        const message = document.createElement('p');

        message.className = 'empty-meals-message';
        message.textContent = 'אין עדיין היסטוריית ארוחות.';

        container.appendChild(message);

        return;
    }

    meals.sort((a, b) => new Date(b.date) - new Date(a.date));

    meals.forEach(meal => {
        container.appendChild(createMealCard(meal));
    });
}

// הודעה כשאין ארוחות
function createNoMealsMessage() {

    const message = document.createElement('p');

    message.className = 'empty-meals-message';
    message.textContent = 'עדיין לא נוספו ארוחות.';

    return message;
}

// עדכון הסיכום היומי
function updateNutritionSummary(calories, protein, carbs, fats) {

    const caloriesElement = document.getElementById('summary-calories');
    const proteinElement = document.getElementById('summary-protein');
    const carbsElement = document.getElementById('summary-carbs');
    const fatsElement = document.getElementById('summary-fats');

    if (caloriesElement) {
        caloriesElement.textContent = calories.toLocaleString();
    }

    if (proteinElement) {
        proteinElement.textContent = `${protein}g`;
    }

    if (carbsElement) {
        carbsElement.textContent = `${carbs}g`;
    }

    if (fatsElement) {
        fatsElement.textContent = `${fats}g`;
    }
}

// עיצוב תאריך להצגה
function formatDate(date) {

    if (!date) return '';

    const dateObject = new Date(date);

    return dateObject.toLocaleDateString('he-IL');
}