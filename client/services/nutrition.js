import { API_URL } from '../shared/config.js';
import { requestJSON } from '../shared/http.js';

const NUTRITION_URL = `${API_URL}/nutrition`;

export const listMeals = () => requestJSON(NUTRITION_URL, { cache: 'no-store' });
export const analyzeMeal = formData => requestJSON(`${NUTRITION_URL}/analyze`, {
    method: 'POST',
    body: formData
});
