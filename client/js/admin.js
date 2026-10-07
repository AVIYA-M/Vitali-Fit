const API_URL_ADMIN = 'http://localhost:5000/api/admin';
const API_URL_WORKOUTS = 'http://localhost:5000/api/workouts';
const API_URL_REVIEWS = 'http://localhost:5000/api/reviews';

document.addEventListener("DOMContentLoaded", () => {
    fetchUsersList();
    fetchAdminReviews();
});

// ==========================================
// ניהול משתמשים במערכת
// ==========================================
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
        
        if (typeof showModalMessage === 'function') {
            showModalMessage('המשתמש נמחק בהצלחה');
        } else {
            alert('המשתמש נמחק בהצלחה');
        }
        fetchUsersList();
    } catch (error) {
        if (typeof showModalMessage === 'function') {
            showModalMessage(error.message);
        } else {
            alert(error.message);
        }
    }
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
        
        if (typeof showModalMessage === 'function') {
            showModalMessage('ההרשאה עודכנה בהצלחה');
        } else {
            alert('ההרשאה עודכנה בהצלחה');
        }
        fetchUsersList();
    } catch (error) {
        console.error(error);
    }
}

// ==========================================
// ניהול אימונים (הוספה ללוח)
// ==========================================
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
    const durationMinutes = Number(document.getElementById('w-duration').value);
    const estimatedCalories = Number(document.getElementById('w-calories').value);
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
                durationMinutes,
                estimatedCalories,
                type,
                category
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'שגיאה ביצירת האימון');
        }

        if (typeof showModalMessage === 'function') {
            showModalMessage('השיעור התווסף בהצלחה למערכת וללוח האימונים!');
        } else {
            alert('השיעור התווסף בהצלחה למערכת וללוח האימונים!');
        }

        closeAddWorkoutModal();
        document.getElementById('create-workout-form').reset();

    } catch (error) {
        if (typeof showModalMessage === 'function') {
            showModalMessage(error.message);
        } else {
            alert(error.message);
        }
    }
}

// ==========================================
// ניהול המלצות קהילה (אישור / דחייה)
// ==========================================
async function fetchAdminReviews() {
    const reviewsTableBody = document.getElementById('reviews-table-body');
    if (!reviewsTableBody) return;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL_REVIEWS}/admin/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('שגיאה בטעינת ההמלצות');

        const reviews = await response.json();

        if (reviews.length === 0) {
            reviewsTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-gray-500">אין המלצות במערכת כרגע.</td></tr>`;
            return;
        }

        reviewsTableBody.innerHTML = reviews.map(review => `
            <tr class="hover:bg-gray-50 transition-colors border-b border-gray-100">
                <td class="py-3 px-6 font-bold text-gray-800">${review.name}</td>
                <td class="py-3 px-6 text-gray-600 max-w-xs truncate" title="${review.text}">"${review.text}"</td>
                <td class="py-3 px-6">
                    <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        review.status === 'approved' ? 'bg-green-100 text-green-700' :
                        review.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                    }">
                        ${review.status === 'approved' ? 'מאושר (מוצג באתר)' : review.status === 'rejected' ? 'נדחה' : 'ממתין לאישור'}
                    </span>
                </td>
                <td class="py-3 px-6 text-center space-x-2 space-x-reverse">
                    <button onclick="updateReviewStatus('${review._id}', 'approved')" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                        אשר
                    </button>
                    <button onclick="updateReviewStatus('${review._id}', 'rejected')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                        דחה
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading reviews:', error);
        reviewsTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-red-500">שגיאה בטעינת ההמלצות מהשרת.</td></tr>`;
    }
}

window.updateReviewStatus = async function(id, status) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL_REVIEWS}/admin/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            // רענון טבלת ההמלצות מיד לאחר שינוי הסטטוס
            fetchAdminReviews();
        } else {
            const data = await response.json();
            alert(`שגיאה בעדכון: ${data.message}`);
        }
    } catch (error) {
        alert('שגיאת תקשורת מול השרת.');
    }
};