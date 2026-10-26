import { API_URL } from '../shared/config.js';
import { requestJSON } from '../shared/http.js';

const REVIEWS_URL = `${API_URL}/reviews`;

export const listApprovedReviews = () => requestJSON(`${REVIEWS_URL}/approved`);
export const listAdminReviews = () => requestJSON(`${REVIEWS_URL}/admin/all`);
export const submitReview = payload => requestJSON(REVIEWS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});
export const updateReviewStatus = (id, status) => requestJSON(`${REVIEWS_URL}/admin/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
});
