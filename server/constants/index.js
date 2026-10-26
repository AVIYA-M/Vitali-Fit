// ערכים קבועים שמשמשים כמה קבצים - מוגדרים במקום אחד בלבד (DRY)

export const USER_ROLES = ['user', 'admin'];

export const REVIEW_STATUSES = ['pending', 'approved', 'rejected'];

// ערך MET לכל סוג פעילות (משמש לחישוב קלוריות)
export const ACTIVITY_MET = {
    walking: 3.5,
    running: 8.0,
    stairs: 8.8,
    cycling: 7.5,
    homeWorkout: 5.0,
    other: 4.0
};

export const ACTIVITY_TYPES = Object.keys(ACTIVITY_MET);

export const WORKOUT_TYPES = ['studio', 'zoom'];
export const WORKOUT_CATEGORIES = ['strength', 'cardio', 'yoga', 'functional', 'general'];
