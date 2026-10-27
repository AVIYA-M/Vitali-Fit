import { API_URL } from '../shared/config.js';
import { requestJSON } from '../shared/http.js';

const AUTH_URL = `${API_URL}/auth`;

// שולחת בקשת הרשמה לשרת.
export const register = payload => requestJSON(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});

// שולחת בקשת התחברות לשרת.
export const login = payload => requestJSON(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});

// מביאה את פרופיל המשתמש המחובר.
export const getProfile = () => requestJSON(`${AUTH_URL}/profile`);
