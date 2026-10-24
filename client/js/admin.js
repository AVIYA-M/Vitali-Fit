
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
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('שגיאה בשליפת המשתמשים');
        }

        const users = await response.json();

        // יצירת שורות הטבלה בצורה בטוחה
        const fragment = document.createDocumentFragment();

        users.forEach(user => {
            const row = document.createElement('tr');

            // שם המשתמש
            const nameCell = document.createElement('td');
            nameCell.className = 'admin-cell-strong';
            nameCell.textContent = user.fullName || 'ללא שם';

            // כתובת אימייל
            const emailCell = document.createElement('td');
            emailCell.className = 'admin-cell-muted';
            emailCell.textContent = user.email || '';

            // תפקיד המשתמש
            const roleCell = document.createElement('td');
            const isAdmin = user.role === 'admin';

            roleCell.className = isAdmin
                ? 'admin-role-admin'
                : 'admin-role-user';

            roleCell.textContent = user.role || 'user';

            // תא הכפתורים
            const actionsCell = document.createElement('td');
            actionsCell.className = 'admin-table-center';

            // כפתור שינוי תפקיד
            const roleButton = document.createElement('button');

            roleButton.type = 'button';
            roleButton.className =
                'admin-action-button admin-action-role';

            roleButton.textContent = isAdmin
                ? 'הפוך לרגיל'
                : 'הפוך למנהל';

            roleButton.addEventListener('click', () => {
                updateUserRole(
                    user._id,
                    isAdmin ? 'user' : 'admin'
                );
            });

            // כפתור מחיקת משתמש
            const deleteButton = document.createElement('button');

            deleteButton.type = 'button';
            deleteButton.className =
                'admin-action-button admin-action-delete';

            deleteButton.textContent = 'מחק';

            deleteButton.addEventListener('click', () => {
                deleteUser(user._id);
            });

            // הרכבת השורה
            actionsCell.append(roleButton, deleteButton);

            row.append(
                nameCell,
                emailCell,
                roleCell,
                actionsCell
            );

            fragment.appendChild(row);
        });

        // החלפת תוכן הטבלה
        tableBody.replaceChildren(fragment);

    } catch (error) {
        console.error('שגיאה בטעינת רשימת המשתמשים:', error);
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

        if (!res.ok) {
            throw new Error(data.message || 'שגיאה במחיקת המשתמש');
        }

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

        if (!res.ok) {
            throw new Error(data.message || 'שגיאה בעדכון ההרשאה');
        }

        alert('ההרשאה עודכנה בהצלחה');
        fetchUsersList();

    } catch (error) {
        console.error(error);
    }
}

// ==========================================
// הצגת אימונים בטבלת הניהול
// ==========================================
async function fetchAdminWorkouts() {
    const tableBody = document.getElementById('workouts-table-body');

    if (!tableBody) return;

    try {
        const response = await fetch(API_URL_WORKOUTS);

        if (!response.ok) {
            throw new Error('שגיאה בשליפת האימונים');
        }

        const workouts = await response.json();

        // אין אימונים להצגה
        if (workouts.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');

            cell.colSpan = 4;
            cell.className = 'admin-table-empty';
            cell.textContent = 'אין אימונים במערכת כרגע.';

            row.appendChild(cell);
            tableBody.replaceChildren(row);

            return;
        }

        // הכנת הטבלה
        const fragment = document.createDocumentFragment();

        workouts.forEach(workout => {
            const row = document.createElement('tr');

            // שם האימון
            const titleCell = document.createElement('td');

            titleCell.className = 'admin-cell-strong';
            titleCell.textContent = workout.title || '';

            // תאריך ושעה
            const dateCell = document.createElement('td');

            dateCell.className = 'admin-cell-muted';

            const workoutDate = workout.date
                ? workout.date.split('T')[0]
                : '';

            dateCell.textContent =
                `${workoutDate} - ${workout.time || ''}`;

            // שם המדריך
            const instructorCell = document.createElement('td');

            instructorCell.className = 'admin-cell-muted';
            instructorCell.textContent = workout.instructor || '';

            // תא פעולות
            const actionsCell = document.createElement('td');

            actionsCell.className = 'admin-table-center';

            // כפתור עריכה
            const editButton = document.createElement('button');

            editButton.type = 'button';
            editButton.className =
                'admin-action-button admin-action-edit';

            editButton.textContent = 'ערוך';

            editButton.addEventListener('click', () => {
                openEditWorkoutModal(workout);
            });

            // כפתור מחיקה
            const deleteButton = document.createElement('button');

            deleteButton.type = 'button';
            deleteButton.className =
                'admin-action-button admin-action-delete';

            deleteButton.textContent = 'מחק';

            deleteButton.addEventListener('click', () => {
                deleteWorkout(workout._id);
            });

            // הרכבת התא והשורה
            actionsCell.append(editButton, deleteButton);

            row.append(
                titleCell,
                dateCell,
                instructorCell,
                actionsCell
            );

            fragment.appendChild(row);
        });

        // הצגת כל השורות בטבלה
        tableBody.replaceChildren(fragment);

    } catch (error) {
        console.error('שגיאה בטעינת האימונים:', error);
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

        if (!response.ok) {
            throw new Error(data.message || 'שגיאה ביצירת האימון');
        }

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
    document.getElementById('edit-w-date').value =
        workout.date ? workout.date.split('T')[0] : '';
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

        if (!response.ok) {
            throw new Error(data.message || 'שגיאה בעדכון האימון');
        }

        alert('האימון עודכן בהצלחה!');

        closeEditWorkoutModal();
        fetchAdminWorkouts();

    } catch (error) {
        alert(error.message);
    }
}

async function deleteWorkout(workoutId) {
    if (!confirm('האם את בטוחה שברצונך למחוק אימון זה? (ההיסטוריה של המשתמשים שהשתתפו בו תישמר).')) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL_WORKOUTS}/${workoutId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'שגיאה במחיקת האימון');
        }

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
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('שגיאה בטעינת ההמלצות');
        }

        const reviews = await response.json();

        // אם אין המלצות, מציגים הודעה
        if (reviews.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');

            cell.colSpan = 4;
            cell.className = 'admin-table-empty';
            cell.textContent = 'אין המלצות במערכת כרגע.';

            row.appendChild(cell);
            reviewsTableBody.replaceChildren(row);

            return;
        }

        // הכנת שורות הטבלה
        const fragment = document.createDocumentFragment();

        reviews.forEach(review => {
            const row = document.createElement('tr');

            // שם הממליץ
            const nameCell = document.createElement('td');

            nameCell.className = 'admin-cell-strong';
            nameCell.textContent = review.name || '';

            // תוכן ההמלצה
            const textCell = document.createElement('td');

            textCell.className =
                'admin-cell-muted admin-review-text';

            textCell.textContent = `"${review.text || ''}"`;

            // מאפיין title מוצג בבטחה באמצעות מאפיין DOM
            textCell.title = review.text || '';

            // סטטוס ההמלצה
            const statusCell = document.createElement('td');
            const statusLabel = document.createElement('span');

            statusLabel.classList.add('admin-status');

            let statusText;

            if (review.status === 'approved') {
                statusLabel.classList.add('admin-status-approved');
                statusText = 'מאושר (מוצג באתר)';
            } else if (review.status === 'rejected') {
                statusLabel.classList.add('admin-status-rejected');
                statusText = 'נדחה';
            } else {
                statusLabel.classList.add('admin-status-pending');
                statusText = 'ממתין לאישור';
            }

            statusLabel.textContent = statusText;
            statusCell.appendChild(statusLabel);

            // תא פעולות
            const actionsCell = document.createElement('td');

            actionsCell.className = 'admin-table-center';

            // כפתור אישור
            const approveButton = document.createElement('button');

            approveButton.type = 'button';
            approveButton.className =
                'admin-action-button admin-action-approve';

            approveButton.textContent = 'אשר';

            approveButton.addEventListener('click', () => {
                window.updateReviewStatus(review._id, 'approved');
            });

            // כפתור דחייה
            const rejectButton = document.createElement('button');

            rejectButton.type = 'button';
            rejectButton.className =
                'admin-action-button admin-action-reject';

            rejectButton.textContent = 'דחה';

            rejectButton.addEventListener('click', () => {
                window.updateReviewStatus(review._id, 'rejected');
            });

            // הרכבת השורה
            actionsCell.append(approveButton, rejectButton);

            row.append(
                nameCell,
                textCell,
                statusCell,
                actionsCell
            );

            fragment.appendChild(row);
        });

        // הצגת השורות בטבלה
        reviewsTableBody.replaceChildren(fragment);

    } catch (error) {
        console.error('שגיאה בטעינת ההמלצות:', error);
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
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('שגיאה בטעינת הפניות');
        }

        const messages = await response.json();

        // אם אין פניות, מציגים הודעה
        if (messages.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');

            cell.colSpan = 6;
            cell.className = 'admin-table-empty';
            cell.textContent = 'עדיין לא התקבלו פניות.';

            row.appendChild(cell);
            tableBody.replaceChildren(row);

            return;
        }

        // יצירת שורות הטבלה בצורה בטוחה
        const fragment = document.createDocumentFragment();

        messages.forEach(message => {
            const row = document.createElement('tr');

            // תאריך קבלת הפנייה
            const dateCell = document.createElement('td');

            dateCell.textContent = message.createdAt
                ? new Date(message.createdAt).toLocaleDateString('he-IL')
                : '-';

            // שם הפונה
            const nameCell = document.createElement('td');

            nameCell.textContent = message.name || '';

            // כתובת אימייל
            const emailCell = document.createElement('td');

            emailCell.textContent = message.email || '';

            // נושא הפנייה
            const subjectCell = document.createElement('td');

            subjectCell.textContent = message.subject || '';

            // תוכן הפנייה
            const messageCell = document.createElement('td');

            messageCell.className = 'admin-preserve-whitespace';
            messageCell.textContent = message.message || '';

            // סטטוס הפנייה
            const statusCell = document.createElement('td');

            if (message.status === 'read') {
                statusCell.textContent = 'נקראה';
            } else if (message.status === 'closed') {
                statusCell.textContent = 'טופלה';
            } else {
                statusCell.textContent = 'חדשה';
            }

            // הרכבת השורה
            row.append(
                dateCell,
                nameCell,
                emailCell,
                subjectCell,
                messageCell,
                statusCell
            );

            fragment.appendChild(row);
        });

        // הצגת כל השורות בטבלה
        tableBody.replaceChildren(fragment);

    } catch (error) {
        console.error('שגיאה בטעינת הפניות:', error);
    }
}


