import { API_URL } from '../shared/config.js';
import { requestJSON } from '../shared/http.js';

const ADMIN_URL = `${API_URL}/admin`;

// מביאה מהשרת את רשימת כל המשתמשים (למנהל).
export const listUsers = () => requestJSON(`${ADMIN_URL}/users`);
// מוחקת משתמש לפי מזהה.
export const deleteUser = id => requestJSON(`${ADMIN_URL}/users/${id}`, { method: 'DELETE' });
// משנה תפקיד של משתמש (user / admin).
export const updateUserRole = (id, role) => requestJSON(`${ADMIN_URL}/users/${id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
});
