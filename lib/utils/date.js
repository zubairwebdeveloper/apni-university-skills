// lib/utils/dates.js

const pad = (n) => String(n).padStart(2, "0");

/**
 * Convert timestamp to UTC date string.
 * @param {number|string|Date} value
 * @returns {string} YYYY-MM-DD
 */
export const utcDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
};

/**
 * Convert timestamp to datetime-local input value.
 * Uses the user's local timezone.
 * @param {number|string|Date} value
 * @returns {string} YYYY-MM-DDTHH:mm
 */
export const toDateTimeInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1,
  )}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/**
 * Convert datetime-local value to ISO string.
 * The browser interprets the value in the user's local timezone.
 * @param {string} value
 * @returns {string}
 */
export const localToISO = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString();
};

/**
 * Get the end of a UTC calendar day.
 * Used for server-side expiry/filter rules.
 * @param {string} value YYYY-MM-DD
 * @returns {Date}
 */
export const endOfDayUTC = (value) => {
  if (!value) {
    throw new TypeError("Date is required");
  }

  const date = new Date(`${value}T23:59:59.999Z`);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError("Invalid date");
  }

  return date;
};

/**
 * Get the start of a UTC calendar day.
 * Used for server-side filtering.
 * @param {string} value YYYY-MM-DD
 * @returns {Date}
 */
export const startOfDayUTC = (value) => {
  if (!value) {
    throw new TypeError("Date is required");
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError("Invalid date");
  }

  return date;
};
