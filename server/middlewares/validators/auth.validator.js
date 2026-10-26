import Joi from 'joi';

// סכמת ולידציה להרשמה
export const registerSchema = Joi.object({

    fullName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'יש להזין שם מלא.',
            'string.min': 'השם המלא חייב להכיל לפחות 2 תווים.',
            'string.max': 'השם המלא יכול להכיל עד 100 תווים.',
            'string.base': 'השם המלא חייב להיות טקסט.',
            'any.required': 'יש להזין שם מלא.'
        }),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(254)
        .required()
        .messages({
            'string.empty': 'יש להזין כתובת אימייל.',
            'string.email': 'כתובת האימייל אינה תקינה.',
            'string.max': 'כתובת האימייל ארוכה מדי.',
            'string.base': 'כתובת האימייל חייבת להיות טקסט.',
            'any.required': 'יש להזין כתובת אימייל.'
        }),

    password: Joi.string()
        .min(6)
        .max(128)
        .pattern(/\S/)
        .required()
        .messages({
            'string.empty': 'יש להזין סיסמה.',
            'string.min': 'הסיסמה חייבת להכיל לפחות 6 תווים.',
            'string.max': 'הסיסמה יכולה להכיל עד 128 תווים.',
            'string.pattern.base': 'הסיסמה אינה יכולה להכיל רווחים בלבד.',
            'string.base': 'הסיסמה חייבת להיות טקסט.',
            'any.required': 'יש להזין סיסמה.'
        })

});

// סכמת ולידציה להתחברות
export const loginSchema = Joi.object({

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(254)
        .required()
        .messages({
            'string.empty': 'יש להזין כתובת אימייל.',
            'string.email': 'כתובת האימייל אינה תקינה.',
            'string.max': 'כתובת האימייל ארוכה מדי.',
            'string.base': 'כתובת האימייל חייבת להיות טקסט.',
            'any.required': 'יש להזין כתובת אימייל.'
        }),

    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'יש להזין סיסמה.',
            'string.base': 'הסיסמה חייבת להיות טקסט.',
            'any.required': 'יש להזין סיסמה.'
        })

});
