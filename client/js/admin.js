const API_URL_ADMIN = `${window.API_BASE_URL}/api/admin`;
const API_URL_WORKOUTS = `${window.API_BASE_URL}/api/workouts`;
const API_URL_REVIEWS = `${window.API_BASE_URL}/api/reviews`;
const API_URL_CONTACT = `${window.API_BASE_URL}/api/contact`;

document.addEventListener("DOMContentLoaded", () => {
    fetchUsersList();
    fetchAdminWorkouts();
    fetchAdminReviews();
    fetchContactMessages();
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
        
        alert('המשתמש נמחק בהצלחה');
        fetchUsersList();
    } catch (error) {
        alert(error.message);
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
        
        alert('ההרשאה עודכנה בהצלחה');
        fetchUsersList();
    } catch (error) {
        console.error(error);
    }
}

// ==========================================
// ניהול אימונים (הוספה, עריכה ומחיקה)
// ==========================================
async function fetchAdminWorkouts() {
    const tableBody = document.getElementById('workouts-table-body');
    if (!tableBody) return;

    try {
        const response = await fetch(API_URL_WORKOUTS);
        if (!response.ok) throw new Error('שגיאה בשליפת האימונים');
        const workouts = await response.json();

        if (workouts.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-gray-500">אין אימונים במערכת כרגע.</td></tr>`;
            return;
        }

        tableBody.innerHTML = workouts.map(workout => `
            <tr class="hover:bg-gray-50 border-b border-gray-100">
                <td class="py-3 px-6 font-medium text-gray-800">${workout.title}</td>
                <td class="py-3 px-6 text-gray-600">${workout.date ? workout.date.split('T')[0] : ''} - ${workout.time || ''}</td>
                <td class="py-3 px-6 text-gray-600">${workout.instructor || ''}</td>
                <td class="py-3 px-6 text-center space-x-2">
                    <button onclick='openEditWorkoutModal(${JSON.stringify(workout)})' class="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-100 transition text-xs">ערוך</button>
                    <button onclick="deleteWorkout('${workout._id}')" class="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition text-xs">מחק</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error(error);
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
    const token = localStorage.getItem('token');

    const bodyData = {
        title: document.getElementById('w-title').value.trim(),
        description: document.getElementById('w-desc').value.trim(),
        date: document.getElementById('w-date').value,
        time: document.getElementById('w-time').value.trim(),
        instructor: document.getElementById('w-instructor').value.trim(),
        maxParticipants: Number(document.getElementById('w-max').value),
        durationMinutes: Number(document.getElementById('w-duration').value),
        estimatedCalories: Number(document.getElementById('w-calories').value),
        type: document.getElementById('w-type').value,
        category: document.getElementById('w-category').value
    };

    try {
        const response = await fetch(API_URL_WORKOUTS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bodyData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'שגיאה ביצירת האימון');

        alert('האימון נוסף בהצלחה!');
        closeAddWorkoutModal();
        document.getElementById('create-workout-form').reset();
        fetchAdminWorkouts();
    } catch (error) {
        alert(error.message);
    }
}

function openEditWorkoutModal(workout) {
    document.getElementById('edit-w-id').value = workout._id;
    document.getElementById('edit-w-title').value = workout.title || '';
    document.getElementById('edit-w-desc').value = workout.description || '';
    document.getElementById('edit-w-date').value = workout.date ? workout.date.split('T')[0] : '';
    document.getElementById('edit-w-time').value = workout.time || '';
    document.getElementById('edit-w-instructor').value = workout.instructor || '';
    document.getElementById('edit-w-max').value = workout.maxParticipants || 30;
    document.getElementById('edit-w-duration').value = workout.durationMinutes || 45;
    document.getElementById('edit-w-calories').value = workout.estimatedCalories || 400;

    document.getElementById('edit-workout-modal').classList.remove('hidden');
}

function closeEditWorkoutModal() {
    document.getElementById('edit-workout-modal').classList.add('hidden');
}

async function handleUpdateWorkout(event) {
    event.preventDefault();
    const workoutId = document.getElementById('edit-w-id').value;
    const token = localStorage.getItem('token');

    const updatedData = {
        title: document.getElementById('edit-w-title').value.trim(),
        description: document.getElementById('edit-w-desc').value.trim(),
        date: document.getElementById('edit-w-date').value,
        time: document.getElementById('edit-w-time').value.trim(),
        instructor: document.getElementById('edit-w-instructor').value.trim(),
        maxParticipants: Number(document.getElementById('edit-w-max').value),
        durationMinutes: Number(document.getElementById('edit-w-duration').value),
        estimatedCalories: Number(document.getElementById('edit-w-calories').value)
    };

    try {
        const response = await fetch(`${API_URL_WORKOUTS}/${workoutId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'שגיאה בעדכון האימון');

        alert('האימון עודכן בהצלחה!');
        closeEditWorkoutModal();
        fetchAdminWorkouts();
    } catch (error) {
        alert(error.message);
    }
}

async function deleteWorkout(workoutId) {
    if (!confirm('האם את בטוחה שברצונך למחוק אימון זה? (ההיסטוריה של המשתמשים שהשתתפו בו תישמר).')) return;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL_WORKOUTS}/${workoutId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'שגיאה במחיקת האימון');

        alert('האימון נמחק בהצלחה!');
        fetchAdminWorkouts();
    } catch (error) {
        alert(error.message);
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
                    <button onclick="updateReviewStatus('${review._id}', 'approved')" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">אשר</button>
                    <button onclick="updateReviewStatus('${review._id}', 'rejected')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">דחה</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading reviews:', error);
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
            fetchAdminReviews();
        } else {
            const data = await response.json();
            alert(`שגיאה בעדכון: ${data.message}`);
        }
    } catch (error) {
        alert('שגיאת תקשורת מול השרת.');
    }
};

// ==========================================
// הצגת פניות שהתקבלו מטופס יצירת קשר
// ==========================================
async function fetchContactMessages() {
    const tableBody = document.getElementById('contact-messages-table-body');
    if (!tableBody) return;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL_CONTACT}/admin/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('שגיאה בטעינת הפניות');
        const messages = await response.json();

        if (messages.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-gray-500">עדיין לא התקבלו פניות.</td></tr>`;
            return;
        }

        tableBody.innerHTML = messages.map(message => `
            <tr class="hover:bg-gray-50 border-b border-gray-100">
                <td class="py-3 px-4">${message.createdAt ? new Date(message.createdAt).toLocaleDateString('he-IL') : '-'}</td>
                <td class="py-3 px-4">${escapeContactText(message.name)}</td>
                <td class="py-3 px-4">${escapeContactText(message.email)}</td>
                <td class="py-3 px-4">${escapeContactText(message.subject)}</td>
                <td class="py-3 px-4 whitespace-pre-wrap">${escapeContactText(message.message)}</td>
                <td class="py-3 px-4">${message.status === 'read' ? 'נקראה' : message.status === 'closed' ? 'טופלה' : 'חדשה'}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('שגיאה בטעינת הפניות:', error);
    }
}

function escapeContactText(value) {
    const element = document.createElement('span');
    element.textContent = value ?? '';
    return element.innerHTML;
}