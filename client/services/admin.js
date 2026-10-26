import { API_URL } from '../shared/config.js';
import { requestJSON } from '../shared/http.js';

const ADMIN_URL = `${API_URL}/admin`;

export const listUsers = () => requestJSON(`${ADMIN_URL}/users`);
export const deleteUser = id => requestJSON(`${ADMIN_URL}/users/${id}`, { method: 'DELETE' });
export const updateUserRole = (id, role) => requestJSON(`${ADMIN_URL}/users/${id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
});
