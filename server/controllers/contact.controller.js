import ContactMessage from '../models/ContactMessage.js';

// שמירת פנייה חדשה (הוולידציה מתבצעת כעת באמצעות Joi)
export const createContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const savedMessage = await ContactMessage.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim()
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