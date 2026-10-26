import Joi from 'joi';

export const mealSchema = Joi.object({
    mealName: Joi.string().trim().min(1).max(100).required().messages({
        'string.empty': 'יש להזין שם ארוחה',
        'string.max': 'שם הארוחה יכול להכיל עד 100 תווים.',
        'any.required': 'יש להזין שם ארוחה'
    }),
    date: Joi.date().optional().messages({
        'date.base': 'תאריך הארוחה אינו תקין.'
    })
});
