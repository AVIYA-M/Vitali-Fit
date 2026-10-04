const API_URL_NUTRITION = 'http://localhost:5000/api/nutrition';
const API_URL_NUTRITION_ANALYZE = `${API_URL_NUTRITION}/analyze`;
let todayMeals = [];
let allMeals = [];

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

        const response = await fetch(API_URL_NUTRITION, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || 'שגיאה בשליפת הארוחות'
            );
        }

        allMeals = data;

        todayMeals = getTodayMeals(allMeals);

        displayMeals(todayMeals);

        displayHistory(getHistoryMeals(allMeals));


    } catch (error) {

        console.error(
            'שגיאה בשליפת הארוחות:',
            error
        );

        showCustomMessageBox(error.message);
    }
}

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

    const mealName =
        document.getElementById('meal-name').value.trim();

    const date =
        document.getElementById('meal-date').value;

    const imageInput =
        document.getElementById('meal-image');

    if (!mealName) {
        showCustomMessageBox(
            'אנא כתוב את שם הארוחה.'
        );
        return;
    }

    if (!imageInput || imageInput.files.length === 0) {
        showCustomMessageBox(
            'אנא העלה תמונה של הארוחה.'
        );
        return;
    }

    const submitButton = document.querySelector(
        '#meal-form button[type="submit"]'
    );

    const originalButtonText =
        submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = 'מנתח את הארוחה...';

    const formData = new FormData();

    formData.append(
        'mealName',
        mealName
    );

    formData.append(
        'date',
        date
    );

    formData.append(
        'image',
        imageInput.files[0]
    );

    try {

        const response = await fetch(
            API_URL_NUTRITION_ANALYZE,
            {
                method: 'POST',

                headers: {
                    'Authorization': `Bearer ${token}`
                },

                body: formData
            }
        );

        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.message ||
                'שגיאה בהוספת הארוחה'
            );
        }

        showCustomMessageBox(
            'הארוחה נוספה בהצלחה!'
        );

        allMeals.push(data.meal);

        todayMeals = getTodayMeals(allMeals);

        displayMeals(todayMeals);

        displayHistory(getHistoryMeals(allMeals));

        // איפוס הטופס
        document
            .getElementById('meal-form')
            .reset();

        document.getElementById(
            'meal-date'
        ).value = getLocalDate();

    } catch (error) {

        console.error(
            'שגיאה בהוספת הארוחה:',
            error
        );

        showCustomMessageBox(
            error.message
        );

    } finally {

        submitButton.disabled = false;

        submitButton.textContent =
            originalButtonText;
    }
}


// הצגת הארוחות
function displayMeals(meals) {

    const container =
        document.getElementById('meals-list');

    const totalCaloriesElement =
        document.getElementById('total-calories');


    if (!container) {
        return;
    }


    container.innerHTML = '';


    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;


    if (meals.length === 0) {

        container.appendChild(
            createNoMealsMessage()
        );

        updateNutritionSummary(
            0,
            0,
            0,
            0
        );

        if (totalCaloriesElement) {
            totalCaloriesElement.textContent =
                '0 Kcal';
        }

        return;
    }


    meals.forEach(meal => {

        totalCalories +=
            Number(meal.calories) || 0;

        totalProtein +=
            Number(meal.protein) || 0;

        totalCarbs +=
            Number(meal.carbs) || 0;

        totalFats +=
            Number(meal.fats) || 0;


        const item =
            document.createElement('div');


        item.className =
            'bg-gray-50 rounded-2xl overflow-hidden';


        item.innerHTML = `
            <details class="group">

                <summary
                    class="cursor-pointer p-4 list-none">

                    <div class="flex justify-between items-center">

                        <div>
                            <h3 class="font-semibold text-gray-800">
                                ${meal.mealName}
                            </h3>

                            <p class="text-xs text-gray-400 mt-1">
                                ${formatDate(meal.date)}
                            </p>
                        </div>

                        <span class="font-bold text-[#1E4630]">
                            ${meal.calories || 0} Kcal
                        </span>

                    </div>

                </summary>


                <div class="px-4 pb-4 border-t border-gray-200 pt-4">

                    ${meal.imageUrl
                ? `
                                <img
                                    src="http://localhost:5000${meal.imageUrl}"
                                    alt="${meal.mealName}"
                                    class="w-full h-48 object-cover rounded-xl mb-4">
                              `
                : ''
            }


                    <div class="grid grid-cols-2 gap-3">

                        <div class="bg-white rounded-xl p-3 text-center">
                            <p class="text-xs text-gray-400">
                                קלוריות
                            </p>

                            <p class="font-bold text-[#1E4630]">
                                ${meal.calories || 0} Kcal
                            </p>
                        </div>


                        <div class="bg-white rounded-xl p-3 text-center">
                            <p class="text-xs text-gray-400">
                                חלבון
                            </p>

                            <p class="font-bold text-[#1E4630]">
                                ${meal.protein || 0}g
                            </p>
                        </div>


                        <div class="bg-white rounded-xl p-3 text-center">
                            <p class="text-xs text-gray-400">
                                פחמימות
                            </p>

                            <p class="font-bold text-[#1E4630]">
                                ${meal.carbs || 0}g
                            </p>
                        </div>


                        <div class="bg-white rounded-xl p-3 text-center">
                            <p class="text-xs text-gray-400">
                                שומנים
                            </p>

                            <p class="font-bold text-[#1E4630]">
                                ${meal.fats || 0}g
                            </p>
                        </div>

                    </div>

                </div>

            </details>
        `;


        container.appendChild(item);
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

function displayHistory(meals) {

    const container =
        document.getElementById('history-list');

    if (!container) {
        return;
    }

    container.innerHTML = '';

    if (meals.length === 0) {

        const message =
            document.createElement('p');

        message.className =
            'text-sm text-gray-400 text-center py-6';

        message.textContent =
            'אין עדיין היסטוריית ארוחות.';

        container.appendChild(message);

        return;
    }

    meals.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    meals.forEach(meal => {

        const item =
            document.createElement('div');

        item.className =
            'bg-gray-50 rounded-2xl overflow-hidden';

        item.innerHTML = `
            <details class="group">

                <summary class="cursor-pointer p-4 list-none">

                    <div class="flex justify-between items-center">

                        <div>
                            <h3 class="font-semibold text-gray-800">
                                ${meal.mealName}
                            </h3>

                            <p class="text-xs text-gray-400 mt-1">
                                ${formatDate(meal.date)}
                            </p>
                        </div>

                        <span class="font-bold text-[#1E4630]">
                            ${meal.calories || 0} Kcal
                        </span>

                    </div>

                </summary>

                <div class="px-4 pb-4 border-t border-gray-200 pt-4">

                    ${
                        meal.imageUrl
                            ? `
                                <img
                                    src="http://localhost:5000${meal.imageUrl}"
                                    alt="${meal.mealName}"
                                    class="w-full h-48 object-cover rounded-xl mb-4">
                              `
                            : ''
                    }

                    <div class="grid grid-cols-2 gap-3">

                        <div class="bg-white rounded-xl p-3 text-center">
                            <p class="text-xs text-gray-400">
                                קלוריות
                            </p>
                            <p class="font-bold text-[#1E4630]">
                                ${meal.calories || 0} Kcal
                            </p>
                        </div>

                        <div class="bg-white rounded-xl p-3 text-center">
                            <p class="text-xs text-gray-400">
                                חלבון
                            </p>
                            <p class="font-bold text-[#1E4630]">
                                ${meal.protein || 0}g
                            </p>
                        </div>

                        <div class="bg-white rounded-xl p-3 text-center">
                            <p class="text-xs text-gray-400">
                                פחמימות
                            </p>
                            <p class="font-bold text-[#1E4630]">
                                ${meal.carbs || 0}g
                            </p>
                        </div>

                        <div class="bg-white rounded-xl p-3 text-center">
                            <p class="text-xs text-gray-400">
                                שומנים
                            </p>
                            <p class="font-bold text-[#1E4630]">
                                ${meal.fats || 0}g
                            </p>
                        </div>

                    </div>

                </div>

            </details>
        `;

        container.appendChild(item);
    });
}
// הודעה כאשר אין ארוחות
function createNoMealsMessage() {

    const message =
        document.createElement('p');

    message.className =
        'text-sm text-gray-400 text-center py-6';

    message.textContent =
        'עדיין לא נוספו ארוחות.';

    return message;
}


// עדכון הסיכום העליון
function updateNutritionSummary(
    calories,
    protein,
    carbs,
    fats
) {

    const caloriesElement =
        document.getElementById('summary-calories');

    const proteinElement =
        document.getElementById('summary-protein');

    const carbsElement =
        document.getElementById('summary-carbs');

    const fatsElement =
        document.getElementById('summary-fats');


    if (caloriesElement) {

        caloriesElement.textContent =
            calories.toLocaleString();
    }


    if (proteinElement) {

        proteinElement.textContent =
            `${protein}g`;
    }


    if (carbsElement) {

        carbsElement.textContent =
            `${carbs}g`;
    }


    if (fatsElement) {

        fatsElement.textContent =
            `${fats}g`;
    }
}


// עיצוב התאריך
function formatDate(date) {

    if (!date) {
        return '';
    }

    const dateObject =
        new Date(date);

    return dateObject.toLocaleDateString('he-IL');
}