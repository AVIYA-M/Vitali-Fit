import Joi from 'joi';
import { ACTIVITY_TYPES } from '../../constants/index.js';

export const activitySchema = Joi.object({
    activityType: Joi.string().valid(...ACTIVITY_TYPES).required().messages({
        'any.only': 'סוג פעילות לא תקין.',
        'any.required': 'יש לבחור סוג פעילות.'
    }),
    durationMinutes: Joi.number().integer().min(1).max(1440).required().messages({
        'number.base': 'משך הפעילות חייב להיות מספר.',
        'number.min': 'משך הפעילות חייב להיות גדול מ-0.',
        'any.required': 'יש להזין משך פעילות.'
    }),
    date: Joi.date().optional().messages({
        'date.base': 'תאריך הפעילות אינו תקין.'
    })
});
