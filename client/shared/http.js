import { API_BASE_URL } from './config.js';
import { clearSession, getToken } from './session.js';

// שולח בקשה לשרת, מוסיף טוקן התחברות, ומטפל בשגיאות (401 מנתק ומעביר להתחברות).
export async function apiFetch(input, options = {}) {
    const inputRequest = input instanceof Request ? input : null;
    const requestInput = input instanceof URL
        ? input.href
        : inputRequest
            ? inputRequest.url
            : input;
    const requestUrl = new URL(requestInput, location.href);
    const apiOrigin = new URL(API_BASE_URL, location.href).origin;
    const headers = new Headers(options.headers || inputRequest?.headers);
    const token = getToken();

    if (token && requestUrl.origin === apiOrigin) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(input, { ...options, headers });

    if (response.status === 401) {
        clearSession();
        if (!['login.html', 'register.html'].includes(location.pathname.split('/').pop())) {
    location.href = '/login.html';        }
        throw new Error('פג תוקף החיבור. יש להתחבר מחדש.');
    }

    if (!response.ok) {
        let message;
        try {
            message = (await response.clone().json()).message;
        } catch (error) {
            if (!(error instanceof SyntaxError)) {
                throw error;
            }
        }
        throw new Error(message || `הבקשה נכשלה (${response.status})`);
    }

    return response;
}

// עטיפה ל-apiFetch שמחזירה את תשובת השרת כ-JSON (או null אם אין תוכן).
export async function requestJSON(input, options = {}) {
    const response = await apiFetch(input, options);
    if (response.status === 204) return null;

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    return response.json();
}
