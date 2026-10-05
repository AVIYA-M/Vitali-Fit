const Tracking = require('../models/Tracking.js');
const Workout = require('../models/Workout.js');


// סימון אימון כהושלם
exports.completeWorkout = async (req, res) => {

  try {

    const userId = req.user.userId;
    const workoutId = req.params.workoutId;


    // חיפוש האימון
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      return res.status(404).json({
        message: 'האימון לא נמצא'
      });
    }


    // בדיקה שהמשתמש רשום לאימון
    const isRegistered = workout.registeredUsers.some(
      id => String(id) === String(userId)
    );

    if (!isRegistered) {
      return res.status(403).json({
        message: 'אפשר לסמן כהושלם רק אימון שנרשמת אליו'
      });
    }


    // בדיקה שהאימון לא סומן כבר כהושלם
    const existingTracking = await Tracking.findOne({
      userId,
      workoutId
    });

    if (existingTracking) {
      return res.status(400).json({
        message: 'האימון כבר סומן כהושלם'
      });
    }


    // בדיקה שהאימון מכיל את הנתונים הדרושים
    if (
      workout.durationMinutes === undefined ||
      workout.estimatedCalories === undefined
    ) {
      return res.status(400).json({
        message: 'לא הוגדרו לאימון משך וקלוריות משוערות'
      });
    }


    // יצירת רשומת Tracking
    const tracking = new Tracking({

      userId,

      workoutId,

      completedAt: new Date(),

      durationMinutes:
        workout.durationMinutes,

      caloriesBurned:
        workout.estimatedCalories

    });


    const savedTracking =
      await tracking.save();


    res.status(201).json({

      message: 'האימון סומן כהושלם בהצלחה',

      tracking: savedTracking

    });


  } catch (error) {

    console.error(
      'שגיאה בסימון אימון כהושלם:',
      error
    );

    res.status(500).json({

      message: 'שגיאה בסימון האימון',

      error: error.message

    });

  }
};



// שליפת נתוני לוח המעקב
exports.getTrackingDashboard = async (req, res) => {

  try {

    const userId = req.user.userId;


    // כל האימונים שהמשתמש השלים
    const trackingRecords =
      await Tracking.find({ userId })
        .populate(
          'workoutId',
          'title date time instructor category'
        )
        .sort({ completedAt: -1 });


    const now = new Date();


    // תחילת השבוע - יום ראשון
    const startOfWeek = new Date(now);

    startOfWeek.setHours(
      0,
      0,
      0,
      0
    );

    startOfWeek.setDate(
      now.getDate() - now.getDay()
    );


    // תחילת החודש
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const upcomingWorkouts = await Workout.find({
      registeredUsers: userId
    }).sort({
      date: 1,
      time: 1
    });

    let upcomingWorkout = null;

    for (const workout of upcomingWorkouts) {
      const workoutDateTime = new Date(workout.date);

      const [hours, minutes] =
        workout.time.split(':').map(Number);

      workoutDateTime.setHours(hours, minutes, 0, 0);

      if (workoutDateTime >= now) {
        upcomingWorkout = workout;
        break;
      }
    }


    // האימונים של השבוע
    const weeklyRecords =
      trackingRecords.filter(record => {

        return new Date(record.completedAt) >= startOfWeek;

      });


    // האימונים של החודש
    const monthlyRecords =
      trackingRecords.filter(record => {

        return new Date(record.completedAt) >= startOfMonth;

      });


    // זמן פעילות כולל
    const totalActivityMinutes =
      trackingRecords.reduce(
        (total, record) =>
          total + (Number(record.durationMinutes) || 0),
        0
      );


    // קלוריות שנשרפו השבוע בלבד
    const weeklyCalories =
      weeklyRecords.reduce(
        (total, record) =>
          total + (Number(record.caloriesBurned) || 0),
        0
      );


    const monthlyGoal = 16;


    let monthlyPercentage =
      (monthlyRecords.length / monthlyGoal) * 100;


    if (monthlyPercentage > 100) {
      monthlyPercentage = 100;
    }



    // היסטוריה - 10 אימונים אחרונים
    const history =
      trackingRecords.slice(0, 10);


    res.status(200).json({
      completedWorkouts: trackingRecords.length,
      activityMinutes: totalActivityMinutes,
      weeklyCalories,
      weeklyWorkouts: weeklyRecords.length,
      monthlyCompleted: monthlyRecords.length,
      monthlyGoal,
      monthlyPercentage,
      upcomingWorkout,
      history
    });


  } catch (error) {

    console.error(
      'שגיאה בשליפת נתוני Tracking:',
      error
    );

    res.status(500).json({

      message: 'שגיאה בשליפת נתוני המעקב',

      error: error.message

    });

  }
};