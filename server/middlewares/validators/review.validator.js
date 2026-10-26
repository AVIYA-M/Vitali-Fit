import Joi from 'joi';
import { REVIEW_STATUSES } from '../../constants/index.js';

export const reviewSchema = Joi.object({
    text: Joi.string().trim().min(3).max(1000).required().messages({
        'string.empty': 'תוכן ההמלצה חסר.',
        'string.min': 'ההמלצה חייבת להכיל לפחות 3 תווים.',
        'string.max': 'ההמלצה יכולה להכיל עד 1000 תווים.',
        'any.required': 'תוכן ההמלצה חסר.'
    }),
    name: Joi.string().trim().max(60).allow('').optional().messages({
        'string.max': 'השם יכול להכיל עד 60 תווים.'
    }),
    isAnonymous: Joi.boolean().optional()
});

export const reviewStatusSchema = Joi.object({
    status: Joi.string().valid(...REVIEW_STATUSES).required().messages({
        'any.only': 'סטטוס לא חוקי.',
        'any.required': 'יש לשלוח סטטוס.'
    })
});
