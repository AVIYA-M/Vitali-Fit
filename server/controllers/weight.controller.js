import User from '../models/User.js';
import WeightHistory from '../models/WeightHistory.js';

// ========================================
// הוספת / עדכון משקל (המשקל נבדק ב-Joi)
// ========================================
export const addWeight = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const weight = req.body.weight;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'המשתמש לא נמצא.'
            });
        }

        // 1. השקילה האחרונה והראשונה *לפני* ההוספה הנוכחית
        const lastRecord = await WeightHistory.findOne({ userId }).sort({ date: -1, _id: -1 });
        let firstWeight = await WeightHistory.findOne({ userId }).sort({ date: 1, _id: 1 });

        // 2. משתמש שכבר היה לו משקל שמור אבל אין היסטוריה - שומרים אותו כנקודת התחלה.
        //    (אם אין שום משקל קודם, השקילה הנוכחית היא נקודת ההתחלה ולא יוצרים רשומה כפולה)
        if (!firstWeight && user.weight) {
            firstWeight = await WeightHistory.create({
                userId,
                weight: Number(user.weight),
                date: user.createdAt || new Date()
            });
        }

        // השקילה הקודמת להשוואה (אם אין היסטוריה, נקודת ההתחלה שנוצרה הרגע)
        const previousRecord = lastRecord || firstWeight;

        // 3. עדכון המשתמש
        user.weight = weight;
        await user.save();

        // 4. שמירת ההיסטוריה החדשה
        const weightRecord = await WeightHistory.create({
            userId,
            weight,
            date: new Date()
        });

        if (!firstWeight) {
            firstWeight = weightRecord;
        }

        // 5. חישוב השינוי מהמשקל ההתחלתי ומהשקילה הקודמת
        const weightChange = Number((weight - Number(firstWeight.weight)).toFixed(1));

        const previousWeightDiff = previousRecord
            ? Number((weight - Number(previousRecord.weight)).toFixed(1))
            : 0;

        res.status(201).json({
            message: 'המשקל עודכן בהצלחה.',
            weight: weightRecord,
            initialWeight: Number(firstWeight.weight),
            currentWeight: weight,
            weightChange,
            previousWeightDiff
        });

    } catch (error) {
        next(error);
    }
};

// ========================================
// היסטוריית משקל - 6 חודשים
// ========================================
export const getWeightHistory = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const history = await WeightHistory.find({
            userId,
            date: { $gte: sixMonthsAgo }
        }).sort({ date: 1 });

        res.status(200).json(history);

    } catch (error) {
        next(error);
    }
};
