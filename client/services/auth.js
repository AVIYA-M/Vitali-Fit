import { API_URL } from '../shared/config.js';
import { requestJSON } from '../shared/http.js';

const AUTH_URL = `${API_URL}/auth`;

export const register = payload => requestJSON(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});

export const login = payload => requestJSON(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});

export const getProfile = () => requestJSON(`${AUTH_URL}/profile`);
