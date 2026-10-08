// components/public/careerUtils.js
// Pure helpers (no "use client") — usable from both server and client files.

export function getCareerTitle(career) {
  return career?.title || career?.name || "Untitled role";
}

export function getCareerCategory(career) {
  return career?.category || career?.field || career?.type || "General";
}

export function getCareerSkills(career) {
  const raw = Array.isArray(career?.skills) ? career.skills : [];
  return raw
    .map((s) => (typeof s === "string" ? s : s?.name || s?.title || ""))
    .filter(Boolean);
}

export function getCareerText(career) {
  return (
    career?.description ||
    career?.summary ||
    career?.excerpt ||
    career?.overview ||
    ""
  );
}
