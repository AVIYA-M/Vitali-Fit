// מחשבת קלוריות שנשרפו לפי משקל, משך הפעילות וערך MET.
export function calculateCalories(weight, durationMinutes, met) {
  return Math.round((met * 3.5 * weight / 200) * durationMinutes);
}

// מחזירה את תחילת השבוע (יום ראשון, 00:00) של התאריך שנתון.
export function getStartOfWeek(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    result.setDate(result.getDate() - result.getDay());
    return result;
}
