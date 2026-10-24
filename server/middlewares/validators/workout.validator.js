import Joi from 'joi';

export const workoutSchema = Joi.object({
    title: Joi.string().min(2).max(150).required().messages({
        'string.min': 'כותרת האימון חייבת להכיל לפחות 2 תווים.',
        'any.required': 'יש להזין כותרת לאימון.'
    }),
    description: Joi.string().min(2).max(500).required().messages({
        'string.min': 'התיאור חייב להכיל לפחות 2 תווים.',
        'any.required': 'יש להזין תיאור לאימון.'
    }),
    date: Joi.date().required().messages({
        'date.base': 'תאריך האימון אינו תקין.',
        'any.required': 'יש להזין תאריך לאימון.'
    }),
    time: Joi.string().required().messages({
        'any.required': 'יש להזין שעת אימון.'
    }),
    instructor: Joi.string().min(2).max(100).required().messages({
        'string.min': 'שם המדריך חייב להכיל לפחות 2 תווים.',
        'any.required': 'יש להזין שם מדריך.'
    }),
    maxParticipants: Joi.number().integer().min(1).max(100).required().messages({
        'number.base': 'מספר משתתפים חייב להיות מספר.',
        'number.min': 'מקסימום משתתפים חייב להיות לפחות 1.',
        'any.required': 'יש להזין מקסימום משתתפים.'
    }),
    durationMinutes: Joi.number().integer().min(1).max(300).required().messages({
        'number.base': 'משך האימון חייב להיות מספר.',
        'number.min': 'משך האימון חייב להיות גדול מ-0.',
        'any.required': 'יש להזין את משך האימון.'
    }),
    estimatedCalories: Joi.number().integer().min(0).max(2000).required().messages({
        'number.base': 'קלוריות משוערות חייבות להיות מספר.',
        'any.required': 'יש להזין קלוריות משוערות.'
    }),
    type: Joi.string().valid('studio', 'zoom').optional(),
    category: Joi.string().valid('strength', 'cardio', 'yoga', 'functional', 'general').optional()
});

export const validateWorkout = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ message: errorMessage });
        }
        next();
    };
};