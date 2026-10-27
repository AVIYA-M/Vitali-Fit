import {
    deleteUser as removeUser,
    listUsers,
    updateUserRole as changeUserRole
} from '../services/admin.js';
import {
    createWorkout,
    deleteWorkout as removeWorkout,
    listWorkouts,
    updateWorkout
} from '../services/workouts.js';
import { listAdminReviews, updateReviewStatus } from '../services/reviews.js';
import { listContactMessages } from '../services/contact.js';
import { requireAuth } from '../shared/session.js';
import { closeModal, confirmMessage, openModal, showMessage } from '../shared/ui/modal.js';

if (requireAuth('admin')) {
    initializeAdmin();
}

function initializeAdmin() {
    document.getElementById('add-workout-button')?.addEventListener('click', () =>
        openModal(document.getElementById('add-workout-modal'))
    );
    document.querySelectorAll('[data-modal-close]').forEach(button => {
        button.addEventListener('click', () => closeModal(
            document.getElementById(button.dataset.modalClose)
        ));
    });
    document.getElementById('create-workout-form')?.addEventListener('submit', handleCreateWorkout);
    document.getElementById('edit-workout-form')?.addEventListener('submit', handleUpdateWorkout);
    loadAdminData();
}

async function loadAdminData() {
    await Promise.all([
        loadUsers(),
        loadWorkouts(),
        loadReviews(),
        loadContactMessages()
    ]);
}

async function loadUsers() {
    const body = document.getElementById('users-table-body');
    if (!body) return;
    try {
        const users = await listUsers();
        if (!users.length) return renderEmptyRow(body, 4, 'אין משתמשים להצגה.');
        const fragment = document.createDocumentFragment();
        users.forEach(user => {
            const row = document.createElement('tr');
            const name = cell(user.fullName || 'ללא שם', 'admin-cell-strong');
            const email = cell(user.email || '', 'admin-cell-muted');
            const role = cell(user.role || 'user', user.role === 'admin' ? 'admin-role-admin' : 'admin-role-user');
            const actions = cell('', 'admin-table-center');

            const roleButton = makeButton(user.role === 'admin' ? 'הפוך לרגיל' : 'הפוך למנהל', 'admin-action-button admin-action-role');
            roleButton.addEventListener('click', () => updateRole(user._id, user.role === 'admin' ? 'user' : 'admin'));
            const deleteButton = makeButton('מחק', 'admin-action-button admin-action-delete');
            deleteButton.addEventListener('click', () => deleteUser(user._id));
            actions.append(roleButton, deleteButton);
            row.append(name, email, role, actions);
            fragment.append(row);
        });
        body.replaceChildren(fragment);
    } catch (error) {
        reportLoadError(body, 4, error);
    }
}

async function deleteUser(id) {
    if (!await confirmMessage('האם את בטוחה שברצונך למחוק משתמש זה?')) return;
    try {
        await removeUser(id);
        showMessage('המשתמש נמחק בהצלחה');
        await loadUsers();
    } catch (error) {
        showMessage(error.message);
    }
}

async function updateRole(id, role) {
    if (!await confirmMessage(`האם לשנות הרשאה ל-${role}?`)) return;
    try {
        await changeUserRole(id, role);
        showMessage('ההרשאה עודכנה בהצלחה');
        await loadUsers();
    } catch (error) {
        showMessage(error.message);
    }
}

async function loadWorkouts() {
    const body = document.getElementById('workouts-table-body');
    if (!body) return;
    try {
        const workouts = await listWorkouts();
        if (!workouts.length) return renderEmptyRow(body, 4, 'אין אימונים במערכת כרגע.');
        const fragment = document.createDocumentFragment();
        workouts.forEach(workout => {
            const row = document.createElement('tr');
            const date = workout.date ? workout.date.split('T')[0] : '';
            row.append(
                cell(workout.title || '', 'admin-cell-strong'),
                cell(`${date}\n${workout.time || ''}`, 'admin-cell-muted'),
                cell(workout.instructor || '', 'admin-cell-muted')
            );
            const actions = cell('', 'admin-table-center');
            const editButton = makeButton('ערוך', 'admin-action-button admin-action-edit');
            editButton.addEventListener('click', () => openEditWorkout(workout));
            const deleteButton = makeButton('מחק', 'admin-action-button admin-action-delete');
            deleteButton.addEventListener('click', () => deleteWorkout(workout._id));
            actions.append(editButton, deleteButton);
            row.append(actions);
            fragment.append(row);
        });
        body.replaceChildren(fragment);
    } catch (error) {
        reportLoadError(body, 4, error);
    }
}

function openEditWorkout(workout) {
    setValue('edit-w-id', workout._id);
    setValue('edit-w-title', workout.title);
    setValue('edit-w-desc', workout.description);
    setValue('edit-w-date', workout.date?.split('T')[0]);
    setValue('edit-w-time', workout.time);
    setValue('edit-w-instructor', workout.instructor);
    setValue('edit-w-max', workout.maxParticipants);
    setValue('edit-w-duration', workout.durationMinutes);
    setValue('edit-w-calories', workout.estimatedCalories);
    openModal(document.getElementById('edit-workout-modal'));
}

async function handleCreateWorkout(event) {
    event.preventDefault();
    const currentForm = event.currentTarget;
    
    try {
        await createWorkout(readWorkoutForm('w-'));
        closeModal(document.getElementById('add-workout-modal'));
        
        if (currentForm) {
            currentForm.reset();
        }

        showMessage('האימון נוסף בהצלחה!');
        await loadWorkouts();
    } catch (error) {
        showMessage(error.message);
    }
}

async function handleUpdateWorkout(event) {
    event.preventDefault();
    const currentForm = event.currentTarget;
    
    try {
        const id = document.getElementById('edit-w-id').value;
        await updateWorkout(id, readWorkoutForm('edit-w-'));
        closeModal(document.getElementById('edit-workout-modal'));
        
        if (currentForm) {
            currentForm.reset();
        }
        
        showMessage('האימון עודכן בהצלחה!');
        await loadWorkouts();
    } catch (error) {
        showMessage(error.message);
    }
}

function readWorkoutForm(prefix) {
    const payload = {
        title: getValue(`${prefix}title`).trim(),
        description: getValue(`${prefix}desc`).trim(),
        date: getValue(`${prefix}date`),
        time: getValue(`${prefix}time`).trim(),
        instructor: getValue(`${prefix}instructor`).trim(),
        maxParticipants: Number(getValue(`${prefix}max`)),
        durationMinutes: Number(getValue(`${prefix}duration`)),
        estimatedCalories: Number(getValue(`${prefix}calories`))
    };
    if (!prefix.startsWith('edit-')) {
        payload.type = getValue('w-type');
        payload.category = getValue('w-category');
    }
    return payload;
}

async function deleteWorkout(id) {
    if (!await confirmMessage('האם את בטוחה שברצונך למחוק אימון זה? ההיסטוריה של המשתתפים תישמר.')) return;
    try {
        await removeWorkout(id);
        showMessage('האימון נמחק בהצלחה!');
        await loadWorkouts();
    } catch (error) {
        showMessage(error.message);
    }
}

async function loadReviews() {
    const body = document.getElementById('reviews-table-body');
    if (!body) return;
    try {
        const reviews = await listAdminReviews();
        if (!reviews.length) return renderEmptyRow(body, 4, 'אין המלצות במערכת כרגע.');
        const fragment = document.createDocumentFragment();
        reviews.forEach(review => {
            const row = document.createElement('tr');
            row.append(cell(review.name || '', 'admin-cell-strong'));
            const text = cell(`"${review.text || ''}"`, 'admin-cell-muted admin-review-text');
            text.title = review.text || '';
            const status = document.createElement('td');
            const statusLabel = document.createElement('span');
            statusLabel.className = `admin-status admin-status-${review.status || 'pending'}`;
            statusLabel.textContent = ({
                approved: 'מאושר (מוצג באתר)',
                rejected: 'נדחה',
                pending: 'ממתין לאישור'
            })[review.status] || 'ממתין לאישור';
            status.append(statusLabel);
            const actions = cell('', 'admin-table-center');
            const approve = makeButton('אשר', 'admin-action-button admin-action-approve');
            approve.addEventListener('click', () => setReviewStatus(review._id, 'approved'));
            const reject = makeButton('דחה', 'admin-action-button admin-action-reject');
            reject.addEventListener('click', () => setReviewStatus(review._id, 'rejected'));
            actions.append(approve, reject);
            row.append(text, status, actions);
            fragment.append(row);
        });
        body.replaceChildren(fragment);
    } catch (error) {
        reportLoadError(body, 4, error);
    }
}

async function setReviewStatus(id, status) {
    try {
        await updateReviewStatus(id, status);
        await loadReviews();
    } catch (error) {
        showMessage(error.message);
    }
}

async function loadContactMessages() {
    const body = document.getElementById('contact-messages-table-body');
    if (!body) return;
    try {
        const messages = await listContactMessages();
        if (!messages.length) return renderEmptyRow(body, 6, 'עדיין לא התקבלו פניות.');
        const fragment = document.createDocumentFragment();
        messages.forEach(message => {
            const row = document.createElement('tr');
            row.append(
                cell(message.createdAt ? new Date(message.createdAt).toLocaleDateString('he-IL') : '-'),
                cell(message.name || ''),
                cell(message.email || ''),
                cell(message.subject || ''),
                cell(message.message || '', 'admin-preserve-whitespace'),
                cell(({ read: 'נקראה', closed: 'טופלה' })[message.status] || 'חדשה')
            );
            fragment.append(row);
        });
        body.replaceChildren(fragment);
    } catch (error) {
        reportLoadError(body, 6, error);
    }
}

function cell(text, className = '') {
    const element = document.createElement('td');
    element.textContent = text;
    if (className) element.className = className;
    return element;
}

function makeButton(text, className) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    return button;
}

function renderEmptyRow(body, columns, message) {
    const row = document.createElement('tr');
    const empty = cell(message, 'admin-table-empty');
    empty.colSpan = columns;
    row.append(empty);
    body.replaceChildren(row);
}

function reportLoadError(body, columns, error) {
    console.error('Failed to load admin data:', error);
    renderEmptyRow(body, columns, error.message || 'טעינת הנתונים נכשלה.');
}

function getValue(id) {
    return document.getElementById(id)?.value || '';
}

function setValue(id, value) {
    const input = document.getElementById(id);
    if (input) input.value = value ?? '';
}