import { API_URL } from '../shared/config.js';
import { requestJSON } from '../shared/http.js';

const CONTACT_URL = `${API_URL}/contact`;

export const submitContact = payload => requestJSON(CONTACT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});
export const listContactMessages = () => requestJSON(`${CONTACT_URL}/admin/all`);
