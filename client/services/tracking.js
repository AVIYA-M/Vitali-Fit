import { API_URL } from '../shared/config.js';
import { requestJSON } from '../shared/http.js';

export const getDashboard = () => requestJSON(`${API_URL}/tracking`);
export const getWeightHistory = () => requestJSON(`${API_URL}/weight/history`);
export const addWeight = weight => requestJSON(`${API_URL}/weight`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weight })
});
export const addActivity = payload => requestJSON(`${API_URL}/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});
export const completeWorkout = id => requestJSON(`${API_URL}/tracking/${id}/complete`, {
    method: 'POST'
});
