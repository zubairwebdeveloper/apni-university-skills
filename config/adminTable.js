// config/adminTable.js
export const CONTENT_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
  { value: "deleted", label: "Trash" },
];
export const CONTENT_STATUSES = CONTENT_STATUS_OPTIONS.map((o) => o.value);
// config/adminTable.js

export const BLOG_STATUS_OPTIONS = [
  ...CONTENT_STATUS_OPTIONS.slice(0, 3),
  {
    value: "scheduled",
    label: "Scheduled",
  },
  ...CONTENT_STATUS_OPTIONS.slice(3),
];

export const BLOG_STATUSES = BLOG_STATUS_OPTIONS.map((option) => option.value);

export const REVIEW_STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
  {
    value: "archived",
    label: "Archived",
  },
  {
    value: "deleted",
    label: "Trash",
  },
];

export const REVIEW_STATUSES = REVIEW_STATUS_OPTIONS.map(
  (option) => option.value,
);

export const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "365d", label: "Last 12 months", days: 365 },
];

const SORT_LABELS = {
  newest: "Newest",
  oldest: "Oldest",
  updated: "Recently updated",
  "name-asc": "Name A–Z",
  "name-desc": "Name Z–A",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Highest rated",
  students: "Most students",
  revenue: "Highest revenue",
  "rating-asc": "Lowest rated",
  "amount-desc": "Amount: high to low",
  "amount-asc": "Amount: low to high",
  usage: "Most used",
};
export const sortOptions = (keys) =>
  keys.map((k) => ({ value: k, label: SORT_LABELS[k] ?? k }));

