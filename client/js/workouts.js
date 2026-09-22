const API_URL_WORKOUTS = 'http://localhost:5000/api/workouts';

document.addEventListener("DOMContentLoaded", () => {
    let currentDate = new Date();
    let selectedDate = new Date();
    let activeFilter = "all";
    let allWorkouts = [];

    function formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    async function fetchWorkouts() {
        try {
            const response = await fetch(API_URL_WORKOUTS);
            if (!response.ok) throw new Error('שגיאה בשליפת הנתונים');
            const data = await response.json();
            allWorkouts = data;
            renderCalendar();
            renderSelectedDaySessions();
        } catch (error) {
            console.error(error);
        }
    }

    function getSessionsForDate(date) {
        const dateString = formatDateKey(date);
        return allWorkouts.filter(w => {
            const wDate = new Date(w.date);
            return formatDateKey(wDate) === dateString;
        });
    }

    function renderSelectedDaySessions() {
        const container = document.getElementById('selected-day-sessions');
        if (!container) return;

        let sessions = getSessionsForDate(selectedDate);
        if (activeFilter !== "all") {
            sessions = sessions.filter(session => session.type === activeFilter);
        }

        if (!sessions.length) {
            container.innerHTML = '<div class="p-4 text-center text-gray-500 text-xs">אין שיעורים שנקבעו ליום זה במערכת</div>';
            return;
        }

        const userStr = localStorage.getItem('user');
        const currentUserId = userStr ? JSON.parse(userStr).id : null;

        container.innerHTML = sessions.map(session => {
            const registeredCount = session.registeredUsers ? session.registeredUsers.length : 0;
            const isFull = registeredCount >= session.maxParticipants;
            const isUserRegistered = session.registeredUsers && currentUserId && session.registeredUsers.includes(currentUserId);
            
            let actionBtn = '';
            if (!userStr) {
                // אם המשתמש לא מחובר
                actionBtn = `<button onclick="showModalMessage('יש להתחבר לחשבון כדי להירשם לאימון'); window.location.href='login.html';" class="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-300">התחבר כדי להירשם</button>`;
            } else if (isUserRegistered) {
                actionBtn = `<button class="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold" disabled>נרשמת בהצלחה</button>`;
            } else if (isFull) {
                actionBtn = `<button class="px-3 py-1.5 bg-gray-300 text-gray-600 rounded-xl text-xs font-semibold" disabled>האימון מלא</button>`;
            } else {
                actionBtn = `<button onclick="registerForSession('${session._id}')" class="px-3 py-1.5 bg-[#1E4630] text-white rounded-xl text-xs font-semibold hover:bg-[#163524]">הרשמה לשיעור</button>`;
            }

            return `
            <div class="p-4 bg-white rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                <div>
                    <span class="text-xs font-bold text-[#1E4630]">${session.time}</span>
                    <h4 class="font-bold text-gray-800 text-sm">${session.title}</h4>
                    <p class="text-xs text-gray-500">מדריך: ${session.instructor}</p>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs text-gray-500">${registeredCount}/${session.maxParticipants} רשומים</span>
                    ${actionBtn}
                </div>
            </div>
            `;
        }).join('');
    }

    window.registerForSession = async function(workoutId) {
        const token = localStorage.getItem('token');
        if (!token) {
            showModalMessage('עלייך להתחבר למערכת כדי להירשם לאימון.');
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch(`${API_URL_WORKOUTS}/${workoutId}/register`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'שגיאה בהרשמה');
            showModalMessage('נרשמת לאימון בהצלחה!');
            fetchWorkouts();
        } catch (error) {
            showModalMessage(error.message);
        }
    };

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const grid = document.getElementById('days-grid');
        
        if (!grid) return;
        grid.innerHTML = '';
        
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        
        for (let i = 0; i < firstDay; i++) {
            grid.appendChild(Object.assign(document.createElement('div'), { className: 'day-box empty' }));
        }

        for (let i = 1; i <= totalDays; i++) {
            const dayBox = document.createElement('div');
            dayBox.className = 'day-box p-2 text-center rounded-xl cursor-pointer hover:bg-gray-100 text-xs font-semibold';
            dayBox.innerText = i;
            
            const currentCellDate = new Date(year, month, i);
            if (selectedDate.toDateString() === currentCellDate.toDateString()) {
                dayBox.classList.add('bg-[#1E4630]', 'text-white');
            }
            
            dayBox.addEventListener('click', () => {
                selectedDate = currentCellDate;
                renderCalendar();
                renderSelectedDaySessions();
            });
            grid.appendChild(dayBox);
        }
    }
    
    fetchWorkouts();
});