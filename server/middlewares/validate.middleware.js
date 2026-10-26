import fs from 'fs';
import AppError from '../utils/AppError.js';


export const validate = (schema, source = 'body') => {
    return (req, res, next) => {

        const { error, value } = schema.validate(req[source] ?? {}, {
            abortEarly: false,
            convert: true,       
            stripUnknown: true  
        });

        if (error) {
            if (req.file?.path) {
                return fs.unlink(req.file.path, unlinkError => {
                    next(unlinkError || new AppError(
                        error.details.map(detail => detail.message).join(', '),
                        400
                    ));
                });
            }

            return next(new AppError(
                error.details.map(detail => detail.message).join(', '),
                400
            ));
        }

        req[source] = value;
        return next();
    };
};
