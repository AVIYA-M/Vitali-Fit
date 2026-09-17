let usersData = [
    { id: 1, name: 'ישראל ישראלי', email: 'israel@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'שרה כהן', email: 'sarah@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'דוד לוי', email: 'david@example.com', role: 'User', status: 'Inactive' },
    { id: 4, name: 'מיכל אברהמי', email: 'michal@example.com', role: 'User', status: 'Active' }
];

function handleAuth(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.querySelector('input[type="email"]')?.value?.trim() || 'משתמש';
    showCustomMessageBox(`התחברת בהצלחה למערכת VitaliFit!\nברוך הבא, ${email}`);
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 600);
}

function handleRegister(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.querySelector('input[type="text"]')?.value?.trim() || 'משתמש חדש';
    showCustomMessageBox(`ההרשמה בוצעה בהצלחה!\nברוכים הבאים, ${name}`);
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 600);
}

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
        protein: 24,
        carbs: 34,
        fats: 15
    };

    if (container) {
        const item = document.createElement('div');
        item.className = 'flex justify-between p-3 bg-gray-50 rounded-xl text-xs font-semibold';
        item.innerHTML = `<span>${predicted.name}</span><span>${predicted.calories} Kcal (${predicted.protein}g חלבון)</span>`;
        container.appendChild(item);
    }

    showCustomMessageBox(`הארוחה נותחה: ${predicted.name}\nקלוריות: ${predicted.calories} kcal\nחלבון: ${predicted.protein}g\nפחמימות: ${predicted.carbs}g\nשומנים: ${predicted.fats}g`);
    if (input) input.value = '';
}

let totalConsumedCalories = 780;
let totalProtein = 110;
let totalCarbs = 190;
let totalFats = 48;
let currentNutritionDateOffset = 0;

// מעבר בין עמודים ראשיים באתר
function switchPage(pageId) {
    document.querySelectorAll('.page-view').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById('page-' + pageId);
    if (target) {
        target.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    ['home', 'workouts', 'nutrition', 'admin'].forEach(id => {
        const btn = document.getElementById('nav-' + id);
        if (btn) {
            if (id === pageId) {
                btn.className = "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 bg-[#1E4630] text-white shadow";
            } else {
                btn.className = "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 text-gray-600 hover:text-[#1E4630] hover:bg-white/60";
            }
        }
    });

    if (pageId === 'admin') {
        renderUsersTable(usersData);
    }
}

// תפריט נייד (מובייל)
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
}

// מעבר בין טאבים במסך התחברות / הרשמה
function switchAuthTab(tab) {
    const loginBtn = document.getElementById('auth-tab-login');
    const regBtn = document.getElementById('auth-tab-register');
    const loginForm = document.getElementById('form-login');
    const regForm = document.getElementById('form-register');

    if (!loginBtn || !regBtn || !loginForm || !regForm) return;

    if (tab === 'login') {
        loginBtn.className = "flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all bg-[#1E4630] text-white shadow";
        regBtn.className = "flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all text-gray-500 hover:text-gray-900";
        loginForm.classList.remove('hidden');
        regForm.classList.add('hidden');
    } else {
        regBtn.className = "flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all bg-[#1E4630] text-white shadow";
        loginBtn.className = "flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all text-gray-500 hover:text-gray-900";
        regForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

function handleAuthSubmit(event, type) {
    event.preventDefault();
    showCustomMessageBox(type === 'login' ? "התחברת בהצלחה למערכת VitaliFit!" : "ההרשמה בוצעה בהצלחה! ברוכים הבאים.");
    switchPage('home');
}

// ניהול טבלת משתמשים (פאנל ניהול)
function renderUsersTable(data) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-gray-500 text-xs">לא נמצאו משתמשים תואמים.</td></tr>`;
        return;
    }

    data.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 transition-colors";
        tr.innerHTML = `
            <td class="py-3.5 px-6 font-semibold text-gray-900 flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[#E8F5F1] border border-[#A3D9C9] flex items-center justify-center text-[#1E4630] text-xs font-bold">
                    ${user.name.charAt(0)}
                </div>
                <span>${user.name}</span>
            </td>
            <td class="py-3.5 px-6 text-gray-600">${user.email}</td>
            <td class="py-3.5 px-6">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${user.role === 'Admin' ? 'bg-[#E8F5F1] text-[#1E4630] border border-[#A3D9C9]' : 'bg-gray-100 text-gray-700 border border-gray-200'}">
                    ${user.role}
                </span>
            </td>
            <td class="py-3.5 px-6">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${user.status === 'Active' ? 'bg-[#E8F5F1] text-[#1E4630] border border-[#A3D9C9]' : 'bg-rose-50 text-rose-600 border border-rose-200'}">
                    <span class="w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-[#1E4630]' : 'bg-rose-500'}"></span>
                    ${user.status}
                </span>
            </td>
            <td class="py-3.5 px-6 text-center">
                <div class="flex items-center justify-center gap-1.5">
                    <button onclick="viewUserProfile('${user.name}', '${user.email}', '${user.role}')" title="צפייה" class="p-1.5 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700 transition-all"><i class="fa-regular fa-eye text-xs"></i></button>
                    <button onclick="editUserPrompt(${user.id})" title="עריכה" class="p-1.5 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200 text-[#1E4630] transition-all"><i class="fa-regular fa-pen-to-square text-xs"></i></button>
                    <button onclick="deleteUser(${user.id})" title="מחיקה" class="p-1.5 rounded-lg bg-gray-100 border border-gray-200 hover:bg-rose-100 text-rose-600 transition-all"><i class="fa-regular fa-trash-can text-xs"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterUsers() {
    const searchInput = document.getElementById('user-search');
    const roleFilter = document.getElementById('role-filter');
    const statusFilter = document.getElementById('status-filter');

    if (!searchInput || !roleFilter || !statusFilter) return;

    const query = searchInput.value.toLowerCase();
    const role = roleFilter.value;
    const status = statusFilter.value;

    const filtered = usersData.filter(u => {
        const matchQuery = u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
        const matchRole = role === 'all' || u.role === role;
        const matchStatus = status === 'all' || u.status === status;
        return matchQuery && matchRole && matchStatus;
    });

    renderUsersTable(filtered);
}

function deleteUser(id) {
    usersData = usersData.filter(u => u.id !== id);
    filterUsers();
    showCustomMessageBox("המשתמש הוסר בהצלחה מהמערכת.");
}

function viewUserProfile(name, email, role) {
    showCustomMessageBox(`פרטי פרופיל משתמש:\nשם: ${name}\nאימייל: ${email}\nתפקיד: ${role}\nסטטוס: פעיל`);
}

function editUserPrompt(id) {
    const user = usersData.find(u => u.id === id);
    if (user) {
        const newName = prompt("ערוך שם משתמש:", user.name);
        if (newName) {
            user.name = newName;
            filterUsers();
            showCustomMessageBox("פרטי המשתמש עודכנו בהצלחה!");
        }
    }
}

function openAddUserModal() {
    const name = prompt("הכנס שם מלא למשתמש החדש:");
    if (!name) return;
    const email = prompt("הכנס כתובת אימייל:");
    if (!email) return;

    usersData.push({ id: Date.now(), name: name, email: email, role: 'User', status: 'Active' });
    filterUsers();
    showCustomMessageBox("המשתמש נוסף בהצלחה!");
}

// ניהול תזונה ותאריכים
function changeNutritionDate(direction) {
    currentNutritionDateOffset += direction;
    const label = document.getElementById('nutrition-date-label');
    if (!label) return;

    if (currentNutritionDateOffset === 0) label.innerText = "היום, 15 בספטמבר";
    else if (currentNutritionDateOffset === 1) label.innerText = "מחר, 16 בספטמבר";
    else if (currentNutritionDateOffset === -1) label.innerText = "אתמול, 14 בספטמבר";
    else label.innerText = `15 בספטמבר (${currentNutritionDateOffset > 0 ? '+' : ''}${currentNutritionDateOffset} ימים)`;
}

// מעבר בין טאבים של AI (טקסט מול תמונה)
function switchAiTab(tab) {
    const textBtn = document.getElementById('aitab-text');
    const photoBtn = document.getElementById('aitab-photo');
    const textMode = document.getElementById('aimode-text');
    const photoMode = document.getElementById('aimode-photo');

    if (!textBtn || !photoBtn || !textMode || !photoMode) return;

    if (tab === 'text') {
        textBtn.className = "flex-1 py-1.5 rounded-lg font-semibold text-xs bg-[#1E4630] text-white transition-all";
        photoBtn.className = "flex-1 py-1.5 rounded-lg font-semibold text-xs text-gray-500 hover:text-gray-900 transition-all";
        textMode.classList.remove('hidden');
        photoMode.classList.add('hidden');
    } else {
        photoBtn.className = "flex-1 py-1.5 rounded-lg font-semibold text-xs bg-[#1E4630] text-white transition-all";
        textBtn.className = "flex-1 py-1.5 rounded-lg font-semibold text-xs text-gray-500 hover:text-gray-900 transition-all";
        photoMode.classList.remove('hidden');
        textMode.classList.add('hidden');
    }
}

// טעינת תמונה לתצוגה מקדימה
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('modal-container')) {
        const modalRoot = document.createElement('div');
        modalRoot.id = 'modal-container';
        document.body.appendChild(modalRoot);
    }

    const fileInput = document.getElementById('ai-food-file');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const previewBox = document.getElementById('image-preview-box');
                    const previewImg = document.getElementById('uploaded-preview-img');
                    if (previewBox && previewImg) {
                        previewImg.src = evt.target.result;
                        previewBox.classList.remove('hidden');
                    }
                }
                reader.readAsDataURL(file);
            }
        });
    }
});

// חיבור ל-Gemini AI לניתוח ארוחות
async function calculateFoodAI(mode) {
    let promptText = "";
    let base64Image = null;

    if (mode === 'text') {
        const promptInput = document.getElementById('ai-food-prompt');
        promptText = promptInput ? promptInput.value.trim() : "";
        if (!promptText) {
            showCustomMessageBox("אנא הקלד תיאור של הארוחה תחילה.");
            return;
        }
    } else {
        const fileInput = document.getElementById('ai-food-file');
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            showCustomMessageBox("אנא בחר צילום ארוחה מהמכשיר.");
            return;
        }
        const file = fileInput.files[0];
        base64Image = await toBase64(file);
        promptText = "Analyze this meal image. Estimate total calories (kcal), protein (g), carbohydrates (g), and fats (g), and provide the name of the meal.";
    }

    showCustomMessageBox("המערכת מנתחת את הארוחה באמצעות Gemini AI...");

    try {
        const systemInstruction = "You are a professional clinical nutritionist and fitness expert. Analyze the user's meal (text or image) and return a strict JSON response with properties: mealName (string), calories (number), protein (number), carbs (number), fats (number). No markdown formatting outside JSON.";
        
        let contents = [];
        if (base64Image) {
            contents.push({
                role: "user",
                parts: [
                    { text: promptText },
                    { inlineData: { mimeType: "image/jpeg", data: base64Image } }
                ]
            });
        } else {
            contents.push({
                role: "user",
                parts: [{ text: `Estimate nutritional values for this meal: ${promptText}` }]
            });
        }

        const payload = {
            contents: contents,
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        mealName: { type: "STRING" },
                        calories: { type: "NUMBER" },
                        protein: { type: "NUMBER" },
                        carbs: { type: "NUMBER" },
                        fats: { type: "NUMBER" }
                    },
                    propertyOrdering: ["mealName", "calories", "protein", "carbs", "fats"]
                }
            }
        };

        const apiKey = ""; // הכנס את מפתח ה-API שלך כאן במידת הצורך
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const candidate = result.candidates?.[0];
        if (candidate && candidate.content?.parts?.[0]?.text) {
            const data = JSON.parse(candidate.content.parts[0].text);
            addCalculatedFoodToLog(data.mealName, data.calories, data.protein, data.carbs, data.fats);
        } else {
            throw new Error("Invalid AI response");
        }
    } catch (err) {
        const fallbackName = mode === 'text' ? promptText : "ארוחה מנותחת AI";
        addCalculatedFoodToLog(fallbackName, 450, 35, 42, 16);
    }
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

function addCalculatedFoodToLog(name, cals, protein, carbs, fats) {
    const container = document.getElementById('meal-items-lunch');
    if (!container) return;

    const div = document.createElement('div');
    div.className = "flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-gray-50 border border-gray-200";
    div.innerHTML = `
        <span class="text-gray-700">✨ ${name} (AI)</span>
        <div class="flex items-center gap-3">
            <span class="text-[#1E4630] font-semibold">${cals} קלוריות (${protein}g חלבון)</span>
            <button onclick="removeFoodItem(this, ${cals})" class="text-gray-400 hover:text-rose-500"><i class="fa-solid fa-trash-can text-xs"></i></button>
        </div>
    `;
    container.appendChild(div);

    totalConsumedCalories += Number(cals);
    totalProtein += Number(protein);
    totalCarbs += Number(carbs);
    totalFats += Number(fats);
    updateNutritionStatsDisplay();

    showCustomMessageBox(`הארוחה זוהתה ונוספה בהצלחה!\nשם: ${name}\nקלוריות: ${cals} kcal\nחלבון: ${protein}g`);
}

function openAddFoodModal(mealName) {
    const foodName = prompt(`הכנס את שם המאכל לארוחת ${mealName === 'Breakfast' ? 'בוקר' : 'צהריים'}:`);
    if (!foodName) return;
    const cals = prompt("הכנס מספר קלוריות (kcal):", "250");
    if (!cals) return;

    const containerId = mealName === 'Breakfast' ? 'meal-items-breakfast' : 'meal-items-lunch';
    const container = document.getElementById(containerId);
    if (container) {
        const div = document.createElement('div');
        div.className = "flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-gray-50 border border-gray-200";
        div.innerHTML = `
            <span class="text-gray-700">${foodName}</span>
            <div class="flex items-center gap-3">
                <span class="text-[#1E4630] font-semibold">${cals} קלוריות</span>
                <button onclick="removeFoodItem(this, ${cals})" class="text-gray-400 hover:text-rose-500"><i class="fa-solid fa-trash-can text-xs"></i></button>
            </div>
        `;
        container.appendChild(div);
        totalConsumedCalories += Number(cals);
        updateNutritionStatsDisplay();
        showCustomMessageBox("הפריט נוסף בהצלחה!");
    }
}

function removeFoodItem(btn, cals) {
    btn.closest('div.flex').remove();
    totalConsumedCalories = Math.max(0, totalConsumedCalories - Number(cals));
    updateNutritionStatsDisplay();
    showCustomMessageBox("הפריט הוסר מהיומן.");
}

function updateNutritionStatsDisplay() {
    const goalCals = 2400;
    const leftCals = Math.max(0, goalCals - totalConsumedCalories);
    const leftEl = document.getElementById('stat-calories-left');
    const proteinEl = document.getElementById('stat-protein');
    const carbsEl = document.getElementById('stat-carbs');
    const fatsEl = document.getElementById('stat-fats');

    if (leftEl) leftEl.innerText = leftCals.toLocaleString();
    if (proteinEl) proteinEl.innerText = totalProtein + 'g';
    if (carbsEl) carbsEl.innerText = totalCarbs + 'g';
    if (fatsEl) fatsEl.innerText = totalFats + 'g';
}

// ניהול אימונים וימים
function selectDay(dayName) {
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.className = "day-btn flex-1 min-w-[80px] py-2.5 px-3 rounded-xl font-semibold text-xs transition-all text-gray-600 hover:bg-gray-100 text-center";
    });
    const activeBtn = document.getElementById('day-' + dayName);
    if (activeBtn) {
        activeBtn.className = "day-btn flex-1 min-w-[80px] py-2.5 px-3 rounded-xl font-semibold text-xs transition-all bg-[#1E4630] text-white shadow text-center";
    }
    const titleSpan = document.getElementById('current-day-title');
    const namesHebrew = {
        'Monday': 'יום שני', 'Tuesday': 'יום שלישי', 'Wednesday': 'יום רביעי',
        'Thursday': 'יום חמישי', 'Friday': 'יום שישי', 'Saturday': 'יום שבת', 'Sunday': 'יום ראשון'
    };
    if (titleSpan) titleSpan.innerText = namesHebrew[dayName] || dayName;
}

function openZoomModal(className, time) {
    showCustomMessageBox(`חיבור לפגישת זום עבור "${className}" בשעה ${time}.\n\n(נפתח חדר אימון חי עם המדריך)`);
}

function logCompletedWorkout() {
    const workoutName = prompt("הכנס את שם האימון שהשלמת:");
    if (!workoutName) return;

    const logList = document.getElementById('activity-log-list');
    if (logList) {
        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs";
        div.innerHTML = `
            <div class="flex items-center gap-2.5">
                <i class="fa-solid fa-circle-check text-[#1E4630]"></i>
                <span class="text-gray-700">${workoutName}</span>
            </div>
            <span class="text-[10px] text-gray-400">היום</span>
        `;
        logList.prepend(div);
        showCustomMessageBox("האימון נוסף בהצלחה ליומן הפעילות!");
    }
}

// חלונות הודעה מותאמים אישית (Modal)
function showCustomMessageBox(message) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;
    modalContainer.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div class="bg-white max-w-sm w-full p-6 rounded-2xl border border-gray-200 shadow-xl text-center space-y-4">
                <div class="w-12 h-12 rounded-xl bg-[#E8F5F1] text-[#1E4630] flex items-center justify-center mx-auto text-xl font-bold border border-[#A3D9C9]">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <div class="space-y-1.5">
                    <h3 class="text-base font-bold text-[#1E4630]">עדכון מערכת VitaliFit</h3>
                    <p class="text-gray-600 text-xs whitespace-pre-line leading-relaxed">${message}</p>
                </div>
                <button onclick="closeCustomMessageBox()" class="w-full py-2.5 rounded-xl bg-[#1E4630] hover:bg-[#163524] text-white font-bold text-xs shadow hover:opacity-95 transition-all">
                    אישור והמשך
                </button>
            </div>
        </div>
    `;
}

function closeCustomMessageBox() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) modalContainer.innerHTML = '';
}
