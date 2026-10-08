// lib/utils/format.js

export const formatPrice = (amount = 0, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);

export const formatCompact = (value = 0) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export const readingMinutes = (text = "") => {
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.round(words / 200));
};

/**
 * Duration is stored in minutes.
 */
export function formatDuration(minutes = 0) {
  if (!minutes) return "Self-paced";

  const totalMinutes = Math.max(0, Number(minutes));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours) {
    return mins ? `${hours}h ${mins}m` : `${hours}h`;
  }

  return `${mins}m`;
}

/**
 * Format a timestamp as a readable date.
 *
 * Example:
 * October 1, 2026
 */
export const formatDate = (ms) =>
  ms
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(new Date(ms))
    : "";

/**
 * Format a timestamp as date + time.
 *
 * Example:
 * Oct 1, 2026, 5:30 PM GMT+5
 *
 * Do not use dateStyle/timeStyle together with timeZoneName.
 */
export const formatDateTime = (ms) =>
  ms
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(new Date(ms))
    : "";
