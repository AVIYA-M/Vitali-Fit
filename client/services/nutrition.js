import { API_URL } from '../shared/config.js';
import { requestJSON } from '../shared/http.js';

const NUTRITION_URL = `${API_URL}/nutrition`;

// מביאה את הארוחות של המשתמש המחובר.
export const listMeals = () => requestJSON(NUTRITION_URL, { cache: 'no-store' });
// שולחת תמונת ארוחה לניתוח תזונתי ושמירה.
export const analyzeMeal = formData => requestJSON(`${NUTRITION_URL}/analyze`, {
    method: 'POST',
    body: formData
});
