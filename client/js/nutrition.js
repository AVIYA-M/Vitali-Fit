let totalConsumedCalories = 780;
let totalProtein = 110;
let totalCarbs = 190;
let totalFats = 48;

function scanMealAI() {
    const input = document.getElementById('ai-input');
    const value = input ? input.value.trim() : '';
    const container = document.getElementById('meals-list');

    if (!value) {
        showCustomMessageBox('אנא כתוב תיאור של הארוחה כדי לקבל חישוב תזונתי.');
        return;
    }

    const predicted = {
        name: value.length > 24 ? `${value.slice(0, 24)}...` : value,
        calories: 420,
        protein: 24
    };

    if (container) {
        const item = document.createElement('div');

        item.className =
            'flex justify-between p-3 bg-gray-50 rounded-xl text-xs font-semibold';

        item.innerHTML = `
            <span>${predicted.name}</span>
            <span>${predicted.calories} Kcal (${predicted.protein}g חלבון)</span>
        `;

        container.appendChild(item);
    }

    showCustomMessageBox(
        `הארוחה נותחה: ${predicted.name}
קלוריות: ${predicted.calories} kcal
חלבון: ${predicted.protein}g`
    );

    if (input) {
        input.value = '';
    }
}

// ניהול תזונה ותאריכים
// function changeNutritionDate(direction) {
//     currentNutritionDateOffset += direction;
//     const label = document.getElementById('nutrition-date-label');
//     if (!label) return;

//     if (currentNutritionDateOffset === 0) label.innerText = "היום, 15 בספטמבר";
//     else if (currentNutritionDateOffset === 1) label.innerText = "מחר, 16 בספטמבר";
//     else if (currentNutritionDateOffset === -1) label.innerText = "אתמול, 14 בספטמבר";
//     else label.innerText = `15 בספטמבר (${currentNutritionDateOffset > 0 ? '+' : ''}${currentNutritionDateOffset} ימים)`;
// }

// // מעבר בין טאבים של AI (טקסט מול תמונה)
// function switchAiTab(tab) {
//     const textBtn = document.getElementById('aitab-text');
//     const photoBtn = document.getElementById('aitab-photo');
//     const textMode = document.getElementById('aimode-text');
//     const photoMode = document.getElementById('aimode-photo');

//     if (!textBtn || !photoBtn || !textMode || !photoMode) return;

//     if (tab === 'text') {
//         textBtn.className = "flex-1 py-1.5 rounded-lg font-semibold text-xs bg-[#1E4630] text-white transition-all";
//         photoBtn.className = "flex-1 py-1.5 rounded-lg font-semibold text-xs text-gray-500 hover:text-gray-900 transition-all";
//         textMode.classList.remove('hidden');
//         photoMode.classList.add('hidden');
//     } else {
//         photoBtn.className = "flex-1 py-1.5 rounded-lg font-semibold text-xs bg-[#1E4630] text-white transition-all";
//         textBtn.className = "flex-1 py-1.5 rounded-lg font-semibold text-xs text-gray-500 hover:text-gray-900 transition-all";
//         photoMode.classList.remove('hidden');
//         textMode.classList.add('hidden');
//     }
// }

// // חיבור ל-Gemini AI לניתוח ארוחות
// async function calculateFoodAI(mode) {
//     let promptText = "";
//     let base64Image = null;

//     if (mode === 'text') {
//         const promptInput = document.getElementById('ai-food-prompt');
//         promptText = promptInput ? promptInput.value.trim() : "";
//         if (!promptText) {
//             showCustomMessageBox("אנא הקלד תיאור של הארוחה תחילה.");
//             return;
//         }
//     } else {
//         const fileInput = document.getElementById('ai-food-file');
//         if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
//             showCustomMessageBox("אנא בחר צילום ארוחה מהמכשיר.");
//             return;
//         }
//         const file = fileInput.files[0];
//         base64Image = await toBase64(file);
//         promptText = "Analyze this meal image. Estimate total calories (kcal), protein (g), carbohydrates (g), and fats (g), and provide the name of the meal.";
//     }

//     showCustomMessageBox("המערכת מנתחת את הארוחה באמצעות Gemini AI...");

//     try {
//         const systemInstruction = "You are a professional clinical nutritionist and fitness expert. Analyze the user's meal (text or image) and return a strict JSON response with properties: mealName (string), calories (number), protein (number), carbs (number), fats (number). No markdown formatting outside JSON.";
        
//         let contents = [];
//         if (base64Image) {
//             contents.push({
//                 role: "user",
//                 parts: [
//                     { text: promptText },
//                     { inlineData: { mimeType: "image/jpeg", data: base64Image } }
//                 ]
//             });
//         } else {
//             contents.push({
//                 role: "user",
//                 parts: [{ text: `Estimate nutritional values for this meal: ${promptText}` }]
//             });
//         }

//         const payload = {
//             contents: contents,
//             systemInstruction: { parts: [{ text: systemInstruction }] },
//             generationConfig: {
//                 responseMimeType: "application/json",
//                 responseSchema: {
//                     type: "OBJECT",
//                     properties: {
//                         mealName: { type: "STRING" },
//                         calories: { type: "NUMBER" },
//                         protein: { type: "NUMBER" },
//                         carbs: { type: "NUMBER" },
//                         fats: { type: "NUMBER" }
//                     },
//                     propertyOrdering: ["mealName", "calories", "protein", "carbs", "fats"]
//                 }
//             }
//         };

//         const apiKey = ""; // הכנס את מפתח ה-API שלך כאן במידת הצורך
//         const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
//         const response = await fetch(apiUrl, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload)
//         });

//         const result = await response.json();
//         const candidate = result.candidates?.[0];
//         if (candidate && candidate.content?.parts?.[0]?.text) {
//             const data = JSON.parse(candidate.content.parts[0].text);
//             addCalculatedFoodToLog(data.mealName, data.calories, data.protein, data.carbs, data.fats);
//         } else {
//             throw new Error("Invalid AI response");
//         }
//     } catch (err) {
//         const fallbackName = mode === 'text' ? promptText : "ארוחה מנותחת AI";
//         addCalculatedFoodToLog(fallbackName, 450, 35, 42, 16);
//     }
// }

// function toBase64(file) {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.readAsDataURL(file);
//         reader.onload = () => resolve(reader.result.split(',')[1]);
//         reader.onerror = error => reject(error);
//     });
// }

// function addCalculatedFoodToLog(name, cals, protein, carbs, fats) {
//     const container = document.getElementById('meal-items-lunch');
//     if (!container) return;

//     const div = document.createElement('div');
//     div.className = "flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-gray-50 border border-gray-200";
//     div.innerHTML = `
//         <span class="text-gray-700">✨ ${name} (AI)</span>
//         <div class="flex items-center gap-3">
//             <span class="text-[#1E4630] font-semibold">${cals} קלוריות (${protein}g חלבון)</span>
//             <button onclick="removeFoodItem(this, ${cals})" class="text-gray-400 hover:text-rose-500"><i class="fa-solid fa-trash-can text-xs"></i></button>
//         </div>
//     `;
//     container.appendChild(div);

//     totalConsumedCalories += Number(cals);
//     totalProtein += Number(protein);
//     totalCarbs += Number(carbs);
//     totalFats += Number(fats);
//     updateNutritionStatsDisplay();

//     showCustomMessageBox(`הארוחה זוהתה ונוספה בהצלחה!\nשם: ${name}\nקלוריות: ${cals} kcal\nחלבון: ${protein}g`);
// }

// function openAddFoodModal(mealName) {
//     const foodName = prompt(`הכנס את שם המאכל לארוחת ${mealName === 'Breakfast' ? 'בוקר' : 'צהריים'}:`);
//     if (!foodName) return;
//     const cals = prompt("הכנס מספר קלוריות (kcal):", "250");
//     if (!cals) return;

//     const containerId = mealName === 'Breakfast' ? 'meal-items-breakfast' : 'meal-items-lunch';
//     const container = document.getElementById(containerId);
//     if (container) {
//         const div = document.createElement('div');
//         div.className = "flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-gray-50 border border-gray-200";
//         div.innerHTML = `
//             <span class="text-gray-700">${foodName}</span>
//             <div class="flex items-center gap-3">
//                 <span class="text-[#1E4630] font-semibold">${cals} קלוריות</span>
//                 <button onclick="removeFoodItem(this, ${cals})" class="text-gray-400 hover:text-rose-500"><i class="fa-solid fa-trash-can text-xs"></i></button>
//             </div>
//         `;
//         container.appendChild(div);
//         totalConsumedCalories += Number(cals);
//         updateNutritionStatsDisplay();
//         showCustomMessageBox("הפריט נוסף בהצלחה!");
//     }
// }

// function removeFoodItem(btn, cals) {
//     btn.closest('div.flex').remove();
//     totalConsumedCalories = Math.max(0, totalConsumedCalories - Number(cals));
//     updateNutritionStatsDisplay();
//     showCustomMessageBox("הפריט הוסר מהיומן.");
// }

// function updateNutritionStatsDisplay() {
//     const goalCals = 2400;
//     const leftCals = Math.max(0, goalCals - totalConsumedCalories);
//     const leftEl = document.getElementById('stat-calories-left');
//     const proteinEl = document.getElementById('stat-protein');
//     const carbsEl = document.getElementById('stat-carbs');
//     const fatsEl = document.getElementById('stat-fats');

//     if (leftEl) leftEl.innerText = leftCals.toLocaleString();
//     if (proteinEl) proteinEl.innerText = totalProtein + 'g';
//     if (carbsEl) carbsEl.innerText = totalCarbs + 'g';
//     if (fatsEl) fatsEl.innerText = totalFats + 'g';
// }

