import Joi from 'joi';

export const contactSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'יש להזין שם באורך 2 עד 100 תווים.',
        'string.max': 'יש להזין שם באורך 2 עד 100 תווים.',
        'any.required': 'יש להזין שם מלא.'
    }),
    email: Joi.string().email().max(254).required().messages({
        'string.email': 'כתובת האימייל אינה תקינה.',
        'any.required': 'יש להזין כתובת אימייל.'
    }),
    subject: Joi.string().min(2).max(150).required().messages({
        'string.min': 'יש להזין נושא באורך 2 עד 150 תווים.',
        'string.max': 'יש להזין נושא באורך 2 עד 150 תווים.',
        'any.required': 'יש להזין נושא.'
    }),
    message: Joi.string().min(5).max(5000).required().messages({
        'string.min': 'ההודעה צריכה להכיל 5 עד 5000 תווים.',
        'string.max': 'ההודעה צריכה להכיל 5 עד 5000 תווים.',
        'any.required': 'יש להזין תוכן הודעה.'
    })
});

export const validateContact = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ message: errorMessage });
        }
        next();
    };
};