import Joi from 'joi';

export const weightSchema = Joi.object({
    weight: Joi.number().min(0.1).max(500).required().messages({
        'number.base': 'המשקל חייב להיות מספר.',
        'number.min': 'המשקל חייב להיות גדול מ-0.',
        'any.required': 'יש להזין ערך משקל.'
    })
});

export const validateWeight = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ message: errorMessage });
        }
        next();
    };
};