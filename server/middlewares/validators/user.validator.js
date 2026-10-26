import Joi from 'joi';
import { USER_ROLES } from '../../constants/index.js';

export const userRoleSchema = Joi.object({
    role: Joi.string().valid(...USER_ROLES).required().messages({
        'any.only': 'תפקיד לא חוקי.',
        'any.required': 'יש לשלוח תפקיד.'
    })
});
