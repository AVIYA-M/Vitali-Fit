const User = require('../models/User.js');
const WeightHistory = require('../models/WeightHistory.js');

// ========================================
// הוספת / עדכון משקל
// ========================================
exports.addWeight = async (req, res) => {
    try {
        const userId = req.user.userId;
        const weight = Number(req.body.weight);

        if (!weight || weight <= 0) {
            return res.status(400).json({
                message: 'המשקל חייב להיות גדול מ-0.'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'המשתמש לא נמצא.'
            });
        }

        // 1. מציאת השקילה האחרונה שהייתה *לפני* ההוספה הנוכחית (השקילה הקודמת)
        const lastRecord = await WeightHistory.findOne({ userId }).sort({ date: -1, _id: -1 });

        // 2. מציאת המשקל ההתחלתי (הראשון אי פעם)
        let firstWeight = await WeightHistory.findOne({ userId }).sort({ date: 1, _id: 1 });

        if (!firstWeight) {
            firstWeight = await WeightHistory.create({
                userId,
                weight: user.weight ? Number(user.weight) : weight,
                date: user.createdAt || new Date()
            });
        }

        // 3. עדכון המשתמש
        user.weight = weight;
        if (!user.weighInDay) {
            user.weighInDay = 'sunday'; 
        }
        await user.save();

        // 4. שמירת ההיסטוריה החדשה
        const weightRecord = await WeightHistory.create({
            userId,
            weight,
            date: new Date()
        });

        // 5. חישוב השינוי מהמשקל ההתחלתי
        const weightChange = Number((weight - Number(firstWeight.weight)).toFixed(1));

        // 6. חישוב השינוי מהשקילה הקודמת (אם קיימת שקילה לפני כן)
        let previousWeightDiff = 0;
        if (lastRecord) {
            previousWeightDiff = Number((weight - Number(lastRecord.weight)).toFixed(1));
        }

        res.status(201).json({
            message: 'המשקל עודכן בהצלחה.',
            weight: weightRecord,
            initialWeight: Number(firstWeight.weight),
            currentWeight: weight,
            weightChange,
            previousWeightDiff
        });

    } catch (error) {
        console.error('שגיאה בעדכון משקל:', error);
        res.status(500).json({
            message: 'שגיאה בעדכון המשקל.',
            error: error.message
        });
    }
};

// ========================================
// היסטוריית משקל - 6 חודשים
// ========================================
exports.getWeightHistory = async (req, res) => {
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
        console.error('שגיאה בשליפת היסטוריית משקל:', error);
        res.status(500).json({
            message: 'שגיאה בשליפת היסטוריית המשקל.',
            error: error.message
        });
    }
};