// lib/firebase/client/errors.js: same message for wrong password / unknown user, so emails can't be probed
const GENERIC_LOGIN = "Incorrect email or password.";
const MAP = {
  "auth/invalid-credential": GENERIC_LOGIN,
  "auth/wrong-password": GENERIC_LOGIN,
  "auth/user-not-found": GENERIC_LOGIN,
  "auth/email-already-in-use":
    "An account with this email already exists. Try logging in.",
  "auth/weak-password": "Choose a stronger password.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed":
    "Network error. Check your connection and try again.",
  "auth/expired-action-code":
    "This link has expired. Please request a new one.",
  "auth/invalid-action-code": "This link is invalid or has already been used.",
  "auth/requires-recent-login": "Please log in again to continue.",
  "auth/user-disabled": "This account has been disabled.",
};
export const authErrorMessage = (e) =>
  MAP[e?.code] ??
  (e?.code
    ? "Something went wrong. Please try again."
    : e?.message || "Something went wrong. Please try again.");

