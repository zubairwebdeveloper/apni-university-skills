// components/public/technologyUtils.js
// Pure helpers (no "use client") — usable from server and client files.

export function getTechName(tech) {
  return tech?.name || tech?.title || "Technology";
}

export function getTechText(tech) {
  return (
    tech?.tagline ||
    tech?.description ||
    tech?.summary ||
    tech?.excerpt ||
    tech?.overview ||
    ""
  );
}

export function getTechCategory(tech) {
  return tech?.category || tech?.type || tech?.field || "";
}

export function getTechTags(tech) {
  const raw =
    (Array.isArray(tech?.skills) && tech.skills) ||
    (Array.isArray(tech?.tags) && tech.tags) ||
    (Array.isArray(tech?.roles) && tech.roles) ||
    [];

  return raw
    .map((s) => (typeof s === "string" ? s : s?.name || s?.title || ""))
    .filter(Boolean);
}
