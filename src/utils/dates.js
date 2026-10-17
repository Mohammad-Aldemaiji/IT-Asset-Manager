/**
 * Date helpers. Dates are stored as "YYYY-MM-DD" strings (the format an
 * <input type="date"> produces), so they can be compared as plain strings.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Today's date in the user's local time zone, as "YYYY-MM-DD". */
export function todayISO(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** True when the string is a real calendar date in "YYYY-MM-DD" form. */
export function isValidISODate(value) {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Whole days from `fromISO` to `toISO` (negative if `toISO` is earlier). */
export function daysBetween(fromISO, toISO) {
  const toUTC = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUTC(toISO) - toUTC(fromISO)) / 86_400_000);
}
