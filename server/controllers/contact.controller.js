import ContactMessage from '../models/ContactMessage.js';

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// שמירת פנייה חדשה
export const createContactMessage = async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        const email = String(req.body.email || '')
            .trim()
            .toLowerCase();

        const subject = String(req.body.subject || '').trim();
        const message = String(req.body.message || '').trim();

        // בדיקת שם
        if (name.length < 2 || name.length > 100) {
            return res.status(400).json({
                message: 'יש להזין שם באורך 2 עד 100 תווים.'
            });
        }

        // בדיקת אימייל
        if (!isValidEmail(email) || email.length > 254) {
            return res.status(400).json({
                message: 'כתובת האימייל אינה תקינה.'
            });
        }

        // בדיקת נושא
        if (subject.length < 2 || subject.length > 150) {
            return res.status(400).json({
                message: 'יש להזין נושא באורך 2 עד 150 תווים.'
            });
        }

        // בדיקת הודעה
        if (message.length < 5 || message.length > 5000) {
            return res.status(400).json({
                message: 'ההודעה צריכה להכיל 5 עד 5000 תווים.'
            });
        }

        // שמירה במסד הנתונים
        const savedMessage = await ContactMessage.create({
            name,
            email,
            subject,
            message
        });

        return res.status(201).json({
            message: 'הפנייה התקבלה ונשמרה במערכת בהצלחה.',
            contactMessageId: savedMessage._id
        });

    } catch (error) {
        console.error('שגיאה בשמירת פנייה:', error);

        return res.status(500).json({
            message: 'לא הצלחנו לשמור את הפנייה כרגע. נסי שוב מאוחר יותר.'
        });
    }
};

// שליפת הפניות עבור המנהל
export const getAdminContactMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find()
            .sort({ createdAt: -1 })
            .limit(200)
            .select('name email subject message status createdAt');

        return res.status(200).json(messages);

    } catch (error) {
        console.error('שגיאה בשליפת הפניות:', error);

        return res.status(500).json({
            message: 'שגיאה בשליפת הפניות.'
        });
    }
};