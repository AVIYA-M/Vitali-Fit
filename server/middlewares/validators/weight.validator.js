import Joi from 'joi';

export const weightSchema = Joi.object({
    weight: Joi.number().min(1).max(500).required().messages({
        'number.base': 'המשקל חייב להיות מספר.',
        'number.min': 'המשקל חייב להיות לפחות 1 ק"ג.',
        'number.max': 'המשקל חייב להיות עד 500 ק"ג.',
        'any.required': 'יש להזין ערך משקל.'
    })
});
