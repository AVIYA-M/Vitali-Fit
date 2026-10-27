import { API_URL } from '../shared/config.js';
import { requestJSON } from '../shared/http.js';

// מביאה את נתוני לוח המעקב האישי.
export const getDashboard = () => requestJSON(`${API_URL}/tracking`);
// מביאה את היסטוריית המשקל.
export const getWeightHistory = () => requestJSON(`${API_URL}/weight/history`);
// שומרת שקילה חדשה.
export const addWeight = weight => requestJSON(`${API_URL}/weight`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weight })
});
// שומרת פעילות גופנית חדשה.
export const addActivity = payload => requestJSON(`${API_URL}/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});
// מסמנת אימון כהושלם.
export const completeWorkout = id => requestJSON(`${API_URL}/tracking/${id}/complete`, {
    method: 'POST'
});
