import { API_URL } from '../shared/config.js';
import { requestJSON } from '../shared/http.js';

const WORKOUTS_URL = `${API_URL}/workouts`;

// מביאה רשימת אימונים, עם אפשרות סינון לפי פרמטרים.
export const listWorkouts = query => {
const url = new URL(WORKOUTS_URL, window.location.origin);
    for (const [key, value] of Object.entries(query || {})) {
        if (value) url.searchParams.set(key, value);
    }
    return requestJSON(url);
};

// יוצרת אימון חדש (למנהל).
export const createWorkout = payload => requestJSON(WORKOUTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});

// מעדכנת אימון קיים (למנהל).
export const updateWorkout = (id, payload) => requestJSON(`${WORKOUTS_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});

// מוחקת אימון (למנהל).
export const deleteWorkout = id => requestJSON(`${WORKOUTS_URL}/${id}`, { method: 'DELETE' });

// רושמת את המשתמש המחובר לאימון.
export const registerForWorkout = id => requestJSON(`${WORKOUTS_URL}/${id}/register`, {
    method: 'POST'
});
