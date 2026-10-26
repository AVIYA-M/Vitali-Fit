import fs from 'fs';

// Middleware אחד לכל הוולידציות עם Joi (מחליף 5 פונקציות כמעט זהות)
// source: 'body' (ברירת מחדל) או 'params'
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {

        // אם לא נשלח גוף בכלל, בודקים אובייקט ריק כדי שהשדות החובה ייתפסו
        const { error, value } = schema.validate(req[source] ?? {}, {
            abortEarly: false,
            convert: true,       // המרות כמו "70" -> 70, וחיתוך רווחים
            stripUnknown: true   // שדות שלא מוגדרים בסכמה נזרקים (הגנה מפני שדות מיותרים)
        });

        if (error) {
            // אם הועלתה תמונה והבדיקה נכשלה - לא משאירים קובץ יתום בשרת
            if (req.file?.path) {
                fs.unlink(req.file.path, () => {});
            }

            return res.status(400).json({
                message: error.details.map(detail => detail.message).join(', ')
            });
        }

        req[source] = value;
        next();
    };
};
