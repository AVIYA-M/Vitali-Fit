const Review = require('../models/Review');
const User = require('../models/User'); // מניח שיש לך מודל משתמש

// 1. הוספת המלצה (למשתמשים מחוברים)
exports.addReview = async (req, res) => {
    try {
        // מתאים למבנה הטוקן שלך (userId או id)
        const userId = req.user.userId || req.user.id || req.user._id; 
        const { text, name, isAnonymous } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'תוכן ההמלצה חסר.' });
        }

        // הגדרת שם התצוגה בהתאם לבחירת המשתמש
        const displayName = isAnonymous ? 'משתמש/ת אנונימי/ת' : (name || 'מתאמנת ב-VitaliFit');

        const newReview = await Review.create({
            userId,
            name: displayName,
            text,
            status: 'pending' // ממתין לאישור מנהל כברירת מחדל
        });

        res.status(201).json({ 
            message: 'תודה רבה! ההמלצה שלך נשלחה ותפורסם לאחר אישור.',
            review: newReview 
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'שגיאה בשליחת ההמלצה.' });
    }
};

// 2. שליפת המלצות מאושרות בלבד (לדף הבית)
exports.getApprovedReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ status: 'approved' })
            .sort({ createdAt: -1 })
            .limit(10); // מציג את 10 ההמלצות האחרונות

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'שגיאה בשליפת המלצות.' });
    }
};

// 3. מנהל: שליפת כל ההמלצות (כולל ממתינות)
exports.getAllReviewsAdmin = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'שגיאה בשליפת נתוני מנהל.' });
    }
};

// 4. מנהל: עדכון סטטוס המלצה (אישור/דחייה)
exports.updateReviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'סטטוס לא חוקי.' });
        }

        const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
        
        if (!review) {
            return res.status(404).json({ message: 'המלצה לא נמצאה.' });
        }

        res.status(200).json({ message: `הסטטוס עודכן ל-${status}`, review });
    } catch (error) {
        res.status(500).json({ message: 'שגיאה בעדכון סטטוס.' });
    }
};