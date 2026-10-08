export function slugify(input = "") {
  return String(input)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// existsFn(slug) -> Promise<boolean>; supplied by each repository
export async function uniqueSlug(base, existsFn) {
  const root = slugify(base) || "item";
  let slug = root,
    n = 1;
  while (await existsFn(slug)) slug = `${root}-${++n}`;
  return slug;
}

