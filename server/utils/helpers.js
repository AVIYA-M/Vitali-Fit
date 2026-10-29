export function calculateCalories(weight, durationMinutes, met) {
  return Math.round((met * 3.5 * weight / 200) * durationMinutes);
}

const WORKOUT_TIME_ZONE = 'Asia/Jerusalem';

function getTimeZoneOffsetMs(date, timeZone) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).formatToParts(date);
    const v = Object.fromEntries(parts.map(part => [part.type, part.value]));
    const asUtc = Date.UTC(v.year, v.month - 1, v.day, v.hour, v.minute, v.second);
    return asUtc - date.getTime();
}

// מחזיר את הרגע המדויק שבו האימון מתחיל (התאריך נשמר כחצות UTC, השעה היא שעון ישראל)
export function getWorkoutStart(workout) {
    const date = new Date(workout.date);
    const [hours, minutes] = String(workout.time || '00:00').split(':').map(Number);
    const guess = Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        hours || 0,
        minutes || 0
    );
    const offset = getTimeZoneOffsetMs(new Date(guess), WORKOUT_TIME_ZONE);
    return new Date(guess - offset);
}

// מחזיר את הרגע שבו האימון נגמר (התחלה + משך)
export function getWorkoutEnd(workout) {
    const start = getWorkoutStart(workout);
    return new Date(start.getTime() + (Number(workout.durationMinutes) || 0) * 60 * 1000);
}

export function getStartOfWeek(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    result.setDate(result.getDate() - result.getDay());
    return result;
}