// client/js/workouts.js
document.addEventListener("DOMContentLoaded", () => {
    let currentDate = new Date(2026, 8, 17); // מתחיל בספטמבר 2026
    let selectedDate = new Date(2026, 8, 17);
    let activeFilter = "all";

    const sessionsByDate = {
        "2026-09-01": [
            { time: "08:00", title: "אימון כוח בסיס", trainer: "מורן כהן", spots: "12/30", type: "studio" },
            { time: "18:30", title: "יוגה לגב ונפילה", trainer: "עדי ברק", spots: "8/20", type: "studio" }
        ],
        "2026-09-03": [
            { time: "09:00", title: "הכנה ללב ורגליים", trainer: "רועי דוד", spots: "15/25", type: "studio" }
        ],
        "2026-09-10": [
            { time: "07:30", title: "HIIT לבוקר", trainer: "אורן לוי", spots: "9/28", type: "studio" },
            { time: "19:00", title: "פילאטיס מתקדמים", trainer: "שיר אלון", spots: "10/18", type: "studio" }
        ],
        "2026-09-17": [
            { time: "08:00", title: "אימון אירובי מתקדם", trainer: "ליהי שרון", spots: "11/30", type: "studio" },
            { time: "17:30", title: "אימוני ליבה", trainer: "נעם אברמוב", spots: "14/22", type: "studio" },
            { time: "20:00", title: "יוגה שקטה בזום", trainer: "הדס רבן", spots: "7/15", type: "zoom" }
        ],
        "2026-09-22": [
            { time: "10:00", title: "אימון פונקציונלי", trainer: "מאיה כהן", spots: "16/30", type: "studio" }
        ],
        "2026-09-24": [
            { time: "18:00", title: "סדנת חיזוק גב", trainer: "יובל נעים", spots: "13/24", type: "studio" },
            { time: "19:30", title: "סטודיו ריצה", trainer: "ליאל בר", spots: "21/30", type: "studio" }
        ],
        "2026-09-29": [
            { time: "08:30", title: "אימון בוקר קלאסי", trainer: "רביד שטרן", spots: "10/25", type: "studio" },
            { time: "18:30", title: "שחייה קלה", trainer: "דנה חן", spots: "6/12", type: "studio" }
        ]
    };

    function formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function renderSelectedDaySessions() {
        const heading = document.getElementById('selected-day-heading');
        const container = document.getElementById('selected-day-sessions');
        const dateText = `${selectedDate.getDate()} ${["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"][selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

        heading.textContent = `שיעורים ב-${dateText}`;

        const key = formatDateKey(selectedDate);
        const sessions = (sessionsByDate[key] || []).filter(session => activeFilter === "all" || session.type === activeFilter);

        if (!sessions.length) {
            container.innerHTML = '<div class="empty-session">אין שיעורים ביום הזה</div>';
            return;
        }

        container.innerHTML = sessions.map(session => `
            <div class="session-item">
                <div class="session-main">
                    <span class="session-time">${session.time}</span>
                    <span class="session-title">${session.title}</span>
                    <span class="session-meta">מדריך: ${session.trainer} · ${session.type === "zoom" ? "אימון מקוון" : "בסטודיו"}</span>
                </div>
                <div class="session-actions">
                    <span class="session-badge ${session.type === "zoom" ? "zoom-badge" : ""}">${session.type === "zoom" ? "זום" : session.spots}</span>
                    <button type="button" class="session-register-btn" data-register-session="true">הרשמה לשיעור</button>
                    ${session.type === "zoom" ? '<button type="button" class="zoom-join-btn" data-zoom-session="true">קבלת קישור</button>' : ''}
                </div>
            </div>
        `).join('');

        container.querySelectorAll('[data-zoom-session]').forEach(button => {
            button.addEventListener('click', () => {
                button.textContent = 'הקישור יישלח לאחר ההרשמה';
                button.classList.add('is-confirmed');
            });
        });

        container.querySelectorAll('[data-register-session]').forEach(button => {
            button.addEventListener('click', () => {
                button.textContent = 'נרשמת בהצלחה';
                button.classList.add('is-registered');
            });
        });
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthsNames = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
        
        document.getElementById('cal-title').innerText = `${monthsNames[month]} ${year}`;
        const grid = document.getElementById('days-grid');
        grid.innerHTML = '';
        
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        
        for (let i = 0; i < firstDay; i++) {
            const emptyBox = document.createElement('div');
            emptyBox.className = 'day-box empty';
            grid.appendChild(emptyBox);
        }

        for (let i = 1; i <= totalDays; i++) {
            const dayBox = document.createElement('div');
            dayBox.className = 'day-box';
            dayBox.innerText = i;
            
            const currentCellDate = new Date(year, month, i);
            const dayOfWeek = currentCellDate.getDay();
            
            if (dayOfWeek === 6) {
                dayBox.classList.add('disabled');
            } else {
                if (
                    selectedDate.getFullYear() === year &&
                    selectedDate.getMonth() === month &&
                    selectedDate.getDate() === i
                ) {
                    dayBox.classList.add('selected');
                }
                
                dayBox.addEventListener('click', () => {
                    selectedDate = currentCellDate;
                    renderCalendar();
                    renderSelectedDaySessions();
                });
            }
            grid.appendChild(dayBox);
        }
    }
    
    document.getElementById('prev-btn').addEventListener('click', () => { 
        currentDate.setMonth(currentDate.getMonth() - 1);
        const newMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        if (selectedDate.getMonth() !== currentDate.getMonth() || selectedDate.getFullYear() !== currentDate.getFullYear()) {
            selectedDate = newMonth;
        }
        renderCalendar();
        renderSelectedDaySessions();
    });
    
    document.getElementById('next-btn').addEventListener('click', () => { 
        currentDate.setMonth(currentDate.getMonth() + 1);
        const newMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        if (selectedDate.getMonth() !== currentDate.getMonth() || selectedDate.getFullYear() !== currentDate.getFullYear()) {
            selectedDate = newMonth;
        }
        renderCalendar();
        renderSelectedDaySessions();
    });

    document.querySelectorAll('.workout-filter').forEach(button => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.filter;
            document.querySelectorAll('.workout-filter').forEach(filterButton => {
                filterButton.classList.toggle('active', filterButton === button);
            });
            renderSelectedDaySessions();
        });
    });
    
    renderCalendar();
    renderSelectedDaySessions();
});