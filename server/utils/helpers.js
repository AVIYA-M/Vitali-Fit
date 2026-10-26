export function calculateCalories(weight, durationMinutes, met) {
  return Math.round((met * 3.5 * weight / 200) * durationMinutes);
}

// תחילת השבוע הנוכחי (יום ראשון, 00:00)
export function getStartOfWeek(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    result.setDate(result.getDate() - result.getDay());
    return result;
}
