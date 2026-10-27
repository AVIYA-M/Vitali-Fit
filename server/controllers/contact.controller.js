import ContactMessage from '../models/ContactMessage.js';

// שומרת פנייה חדשה מטופס יצירת הקשר.
export const createContactMessage = async (req, res, next) => {
    const { name, email, subject, message } = req.body;

    const savedMessage = await ContactMessage.create({ name, email, subject, message });

    return res.status(201).json({
        message: 'הפנייה התקבלה ונשמרה במערכת בהצלחה.',
        contactMessageId: savedMessage._id
    });
};

// מחזירה למנהל את 200 הפניות האחרונות.
export const getAdminContactMessages = async (req, res, next) => {
    const messages = await ContactMessage.find()
        .sort({ createdAt: -1 })
        .limit(200)
        .select('name email subject message status createdAt');

    return res.status(200).json(messages);
};
