import User from '../models/User.js';
import WeightHistory from '../models/WeightHistory.js';
import AppError from '../utils/AppError.js';


// שומרת שקילה חדשה, מעדכנת את משקל המשתמש ומחשבת שינוי מההתחלה ומהשקילה הקודמת.
export const addWeight = async (req, res, next) => {
    const userId = req.user.userId;
    const weight = req.body.weight;

    const user = await User.findById(userId);
    if (!user) {
        return next(new AppError('המשתמש לא נמצא.', 404));
    }

    const lastRecord = await WeightHistory.findOne({ userId }).sort({ date: -1, _id: -1 });
    let firstWeight = await WeightHistory.findOne({ userId }).sort({ date: 1, _id: 1 });

    if (!firstWeight && user.weight) {
        firstWeight = await WeightHistory.create({
            userId,
            weight: Number(user.weight),
            date: user.createdAt || new Date()
        });
    }

    const previousRecord = lastRecord || firstWeight;

    user.weight = weight;
    await user.save();

    const weightRecord = await WeightHistory.create({
        userId,
        weight,
        date: new Date()
    });

    if (!firstWeight) {
        firstWeight = weightRecord;
    }

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
};


// מחזירה את היסטוריית השקילות של 6 החודשים האחרונים.
export const getWeightHistory = async (req, res, next) => {
    const userId = req.user.userId;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const history = await WeightHistory.find({
        userId,
        date: { $gte: sixMonthsAgo }
    }).sort({ date: 1 });

    res.status(200).json(history);
};
