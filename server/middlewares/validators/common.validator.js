import Joi from 'joi';

const objectId = Joi.string().hex().length(24).required().messages({
    'string.length': 'המזהה אינו תקין.',
    'string.hex': 'המזהה אינו תקין.',
    'string.base': 'המזהה אינו תקין.',
    'any.required': 'חסר מזהה.'
});

// /:id
export const idParamSchema = Joi.object({ id: objectId });

// /:workoutId
export const workoutIdParamSchema = Joi.object({ workoutId: objectId });
