// כתובת בסיסית של השרת
window.API_BASE_URL = 'http://localhost:5000';

window.apiFetch = async (input, options = {}) => {
    const requestUrl = new URL(
        typeof input === 'string' ? input : input.url,
        window.location.href
    );
    const apiOrigin = new URL(window.API_BASE_URL, window.location.href).origin;
    const headers = new Headers(
        options.headers || (input instanceof Request ? input.headers : undefined)
    );
    const token = localStorage.getItem('token');

    if (token && requestUrl.origin === apiOrigin) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(input, { ...options, headers });

    if (!response.ok) {
        let message;

        try {
            message = (await response.clone().json()).message;
        } catch {
            // Keep the HTTP status as a useful fallback for non-JSON responses.
        }

        throw new Error(message || `בקשת השרת נכשלה (${response.status})`);
    }

    return response;
};