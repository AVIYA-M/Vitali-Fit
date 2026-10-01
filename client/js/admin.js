const API_URL_ADMIN = 'http://localhost:5000/api/admin';
const API_URL_WORKOUTS = 'http://localhost:5000/api/workouts';

document.addEventListener("DOMContentLoaded", () => {
    fetchUsersList();
});

async function fetchUsersList() {
    const token = localStorage.getItem('token');
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    try {
        const response = await fetch(`${API_URL_ADMIN}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('שגיאה בשליפת המשתמשים');
        
        const users = await response.json();
        
        // יצירת הטבלה כולל כפתור מחיקה וכפתור לשינוי הרשאה
        tableBody.innerHTML = users.map(user => `
            <tr class="hover:bg-gray-50 border-b border-gray-100">
                <td class="py-3 px-6 font-medium text-gray-800">${user.fullName || 'ללא שם'}</td>
                <td class="py-3 px-6 text-gray-500">${user.email}</td>
                <td class="py-3 px-6 font-semibold ${user.role === 'admin' ? 'text-emerald-600' : 'text-gray-600'}">${user.role}</td>
                <td class="py-3 px-6 text-center space-x-2">
                    <button onclick="updateUserRole('${user._id}', '${user.role === 'admin' ? 'user' : 'admin'}')" class="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-xs">
                        ${user.role === 'admin' ? 'הפוך לרגיל' : 'הפוך למנהל'}
                    </button>
                    <button onclick="deleteUser('${user._id}')" class="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition text-xs">מחק</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error(error);
    }
}

async function deleteUser(userId) {
    if (!confirm('האם את בטוחה שברצונך למחוק משתמש זה?')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL_ADMIN}/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'שגיאה במחיקת המשתמש');
        
      showModalMessage('המשתמש נמחק בהצלחה');
        fetchUsersList(); // רענון הטבלה
    } catch (error) {
    showModalMessage(error.message);    }
}

async function updateUserRole(userId, newRole) {
    if (!confirm(`האם לשנות הרשאה ל-${newRole}?`)) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL_ADMIN}/users/${userId}/role`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'שגיאה בעדכון ההרשאה');
        
      showModalMessage('ההרשאה עודכנה בהצלחה');
        fetchUsersList(); // רענון הטבלה
    } catch (error) {
        (error.message);
    }
}

function openAddWorkoutModal() {
    document.getElementById('add-workout-modal').classList.remove('hidden');
}

function closeAddWorkoutModal() {
    document.getElementById('add-workout-modal').classList.add('hidden');
}

async function handleCreateWorkout(event) {
    event.preventDefault();
    const title = document.getElementById('w-title').value.trim();
    const description = document.getElementById('w-desc').value.trim();
    const date = document.getElementById('w-date').value;
    const time = document.getElementById('w-time').value.trim();
    const instructor = document.getElementById('w-instructor').value.trim();
    const maxParticipants = Number(document.getElementById('w-max').value);
    const type = document.getElementById('w-type').value;
    const category = document.getElementById('w-category').value;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(API_URL_WORKOUTS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                  title,
                  description,
                  date,
                  time,
                  instructor,
                  maxParticipants,
                  type,
                  category
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'שגיאה ביצירת האימון');

        // הודעת הצלחה ברורה שמקפיצה אישור למנהל!
       showModalMessage('השיעור התווסף בהצלחה למערכת וללוח האימונים!');
        closeAddWorkoutModal();
        document.getElementById('create-workout-form').reset();
    } catch (error) {
        showModalMessage(error.message);
    }
}