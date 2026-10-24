import Joi from 'joi';

export const activitySchema = Joi.object({
    activityType: Joi.string().valid('walking', 'running', 'stairs', 'cycling', 'homeWorkout', 'other').required().messages({
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

export const validateActivity = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ message: errorMessage });
        }
        next();
    };
};