// lib/utils/search.js
const tokenize = (s = "") =>
  String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9+#.]+/)
    .filter((t) => t.length >= 2);

// Written to course.searchKeywords. Prefixes (2..10 chars) give type-ahead style matching.
export function buildSearchKeywords(...parts) {
  const set = new Set();
  for (const t of parts.flat().flatMap(tokenize)) {
    set.add(t);
    for (let i = 2; i <= Math.min(t.length, 10); i++) set.add(t.slice(0, i));
  }
  return [...set].slice(0, 200);
}

// Firestore allows one array-contains per query, so we search on the longest word.
export function toKeyword(q) {
  if (!q) return undefined;
  const longest = tokenize(q).sort((a, b) => b.length - a.length)[0];
  return longest?.slice(0, 10);
}

