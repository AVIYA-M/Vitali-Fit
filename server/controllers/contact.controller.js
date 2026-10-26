import ContactMessage from '../models/ContactMessage.js';

// שמירת פנייה חדשה (הניקוי והוולידציה מתבצעים ב-Joi)
export const createContactMessage = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        const savedMessage = await ContactMessage.create({ name, email, subject, message });

        return res.status(201).json({
            message: 'הפנייה התקבלה ונשמרה במערכת בהצלחה.',
            contactMessageId: savedMessage._id
        });

    } catch (error) {
        next(error);
    }
};

export const getAdminContactMessages = async (req, res, next) => {
    try {
        const messages = await ContactMessage.find()
            .sort({ createdAt: -1 })
            .limit(200)
            .select('name email subject message status createdAt');

        return res.status(200).json(messages);

    } catch (error) {
        next(error);
    }
};
