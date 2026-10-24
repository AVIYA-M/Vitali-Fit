import Joi from 'joi';

// סכמת ולידציה להרשמה
export const registerSchema = Joi.object({
    fullName: Joi.string().min(2).max(100).required().messages({
        'string.min': 'השם המלא חייב להכיל לפחות 2 תווים.',
        'string.max': 'השם המלא יכול להכיל עד 100 תווים.',
        'any.required': 'יש להזין שם מלא.'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'כתובת האימייל אינה תקינה.',
        'any.required': 'יש להזין כתובת אימייל.'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'הסיסמה חייבת להכיל לפחות 6 תווים.',
        'any.required': 'יש להזין סיסמה.'
    })
});

// סכמת ולידציה להתרבות / התחברות
export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'כתובת האימייל אינה תקינה.',
        'any.required': 'יש להזין כתובת אימייל.'
    }),
    password: Joi.string().required().messages({
        'any.required': 'יש להזין סיסמה.'
    })
});

// פונקציית Middleware כללית להפעלת הבדיקה
export const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ message: errorMessage });
        }
        next();
    };
};