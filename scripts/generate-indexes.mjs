// scripts/generate-indexes.mjs

import { writeFileSync } from "node:fs";

const asc = (fieldPath) => ({
  fieldPath,
  order: "ASCENDING",
});

const desc = (fieldPath) => ({
  fieldPath,
  order: "DESCENDING",
});

const arr = (fieldPath) => ({
  fieldPath,
  arrayConfig: "CONTAINS",
});

const idx = (collectionGroup, ...fields) => ({
  collectionGroup,
  queryScope: "COLLECTION",
  fields,
});

/**
 * Firestore Index Strategy
 *
 * - Add all required composite indexes first.
 * - Rely on Firestore index merging where possible.
 * - Remove duplicate index definitions before writing.
 * - Generate firestore.indexes.json only once at the end.
 */

const indexes = [];

/* -------------------------------------------------------------------------- */
/* Courses                                                                    */
/* -------------------------------------------------------------------------- */

const courseSorts = [
  desc("createdAt"),
  asc("createdAt"),
  desc("updatedAt"),
  asc("title"),
  desc("title"),
  asc("price"),
  desc("price"),
  desc("rating"),
  desc("studentsCount"),
  desc("revenue"),
];

const courseFilters = [
  "categorySlug",
  "instructorSlug",
  "isFree",
  "level",
  "language",
  "featured",
];

for (const sort of courseSorts) {
  indexes.push(idx("courses", asc("status"), sort));
}

for (const filter of courseFilters) {
  for (const sort of courseSorts) {
    indexes.push(idx("courses", asc("status"), asc(filter), sort));
  }
}

indexes.push(
  idx("courses", asc("categoryId"), asc("status")),
  idx("courses", asc("instructorId"), asc("status")),
  idx("courses", asc("status"), asc("categorySlug"), asc("studentsCount")),
  idx("courses", asc("status"), asc("categoryId"), desc("publishedAt")),
  idx("courses", asc("status"), asc("instructorId"), desc("publishedAt")),
  idx("courses", arr("searchKeywords"), desc("publishedAt")),
);

/* -------------------------------------------------------------------------- */
/* Careers                                                                    */
/* -------------------------------------------------------------------------- */

indexes.push(
  idx("careers", asc("status"), asc("order")),
  idx("careers", asc("status"), desc("createdAt")),
  idx("careers", asc("status"), asc("createdAt")),
  idx("careers", asc("status"), desc("updatedAt")),
  idx("careers", asc("status"), asc("title")),
  idx("careers", asc("status"), desc("title")),
  idx("careers", arr("searchKeywords"), asc("status"), desc("createdAt")),
);

/* -------------------------------------------------------------------------- */
/* Technologies                                                               */
/* -------------------------------------------------------------------------- */

indexes.push(idx("technologies", asc("status"), asc("order")));

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

indexes.push(
  idx("categories", asc("status"), asc("order")),
  idx("categories", asc("status"), desc("createdAt")),
  idx("categories", asc("status"), asc("createdAt")),
  idx("categories", asc("status"), desc("updatedAt")),
  idx("categories", asc("status"), asc("name")),
  idx("categories", asc("status"), desc("name")),
  idx("categories", arr("searchKeywords"), asc("status"), desc("createdAt")),
);

/* -------------------------------------------------------------------------- */
/* Instructors                                                                */
/* -------------------------------------------------------------------------- */

indexes.push(
  idx("instructors", asc("status"), desc("studentsCount")),
  idx("instructors", asc("status"), desc("createdAt")),
  idx("instructors", asc("status"), asc("createdAt")),
  idx("instructors", asc("status"), desc("updatedAt")),
  idx("instructors", asc("status"), asc("name")),
  idx("instructors", asc("status"), desc("name")),
  idx("instructors", arr("searchKeywords"), asc("status"), desc("createdAt")),
);

/* -------------------------------------------------------------------------- */
/* Blog Posts                                                                 */
/* -------------------------------------------------------------------------- */

indexes.push(
  idx("blogPosts", asc("status"), asc("category"), desc("publishedAt")),
  idx("blogPosts", asc("status"), desc("publishedAt")),
  idx("blogPosts", arr("tags"), desc("publishedAt")),
  idx("blogPosts", asc("status"), desc("createdAt")),
  idx("blogPosts", asc("status"), asc("createdAt")),
  idx("blogPosts", asc("status"), desc("updatedAt")),
  idx("blogPosts", asc("status"), asc("title")),
  idx("blogPosts", asc("status"), desc("title")),
  idx("blogPosts", arr("searchKeywords"), asc("status"), desc("createdAt")),
);

/* -------------------------------------------------------------------------- */
/* Jobs                                                                       */
/* -------------------------------------------------------------------------- */

indexes.push(
  idx("jobs", asc("status"), asc("remote"), desc("publishedAt")),
  idx("jobs", asc("status"), asc("employmentType"), desc("publishedAt")),
  idx("jobs", asc("status"), asc("experienceLevel"), desc("publishedAt")),
  idx("jobs", asc("status"), arr("skills"), desc("publishedAt")),
  idx("jobs", asc("status"), desc("publishedAt")),
  idx("jobs", asc("status"), desc("createdAt")),
  idx("jobs", asc("status"), asc("createdAt")),
  idx("jobs", asc("status"), desc("updatedAt")),
  idx("jobs", asc("status"), asc("title")),
  idx("jobs", asc("status"), desc("title")),
  idx("jobs", arr("searchKeywords"), asc("status"), desc("createdAt")),
);

/* -------------------------------------------------------------------------- */
/* Lessons                                                                    */
/* -------------------------------------------------------------------------- */

indexes.push(
  idx(
    "lessons",
    asc("courseId"),
    asc("isPublished"),
    asc("sectionOrder"),
    asc("order"),
  ),
);

/* -------------------------------------------------------------------------- */
/* Reviews                                                                    */
/* -------------------------------------------------------------------------- */

indexes.push(
  idx("reviews", asc("status"), desc("createdAt")),
  idx("reviews", asc("courseId"), desc("createdAt")),
  idx("reviews", asc("instructorId"), desc("createdAt")),
);

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

for (const sort of [desc("createdAt"), asc("createdAt")]) {
  indexes.push(
    idx("users", asc("role"), sort),
    idx("users", asc("role"), asc("isActive"), sort),
    idx("users", asc("role"), asc("emailVerified"), sort),
    idx("users", asc("isActive"), sort),
    idx("users", asc("emailVerified"), sort),
    idx("users", arr("searchKeywords"), sort),
    idx("users", asc("role"), arr("searchKeywords"), sort),
    idx("users", asc("role"), asc("isActive"), arr("searchKeywords"), sort),
  );
}

for (const nameOrder of [asc("displayName"), desc("displayName")]) {
  indexes.push(idx("users", asc("role"), nameOrder));
}

indexes.push(idx("users", asc("role"), asc("createdAt")));

/* -------------------------------------------------------------------------- */
/* Enrollments                                                                */
/* -------------------------------------------------------------------------- */

for (const filter of ["status", "courseSlug", "studentId"]) {
  for (const sort of [desc("enrolledAt"), asc("enrolledAt")]) {
    indexes.push(idx("enrollments", asc(filter), sort));
  }
}

indexes.push(
  idx("enrollments", asc("status"), desc("progress")),
  idx("enrollments", asc("status"), asc("courseSlug"), desc("enrolledAt")),
);

/* -------------------------------------------------------------------------- */
/* Payments                                                                   */
/* -------------------------------------------------------------------------- */

for (const sort of [desc("createdAt"), asc("createdAt")]) {
  for (const field of ["courseSlug", "status"]) {
    indexes.push(idx("payments", asc(field), sort));
  }
}

indexes.push(
  idx("payments", asc("status"), asc("amount")),
  idx("payments", asc("status"), desc("amount")),
  idx("payments", asc("status"), asc("courseSlug"), desc("createdAt")),
  idx("payments", asc("courseSlug"), desc("createdAt")),
  idx("payments", asc("status"), asc("currency"), asc("createdAt")),
  idx("payments", asc("status"), asc("currency"), asc("amount")),
  idx("payments", asc("status"), asc("createdAt")),
);

/* -------------------------------------------------------------------------- */
/* Contacts                                                                   */
/* -------------------------------------------------------------------------- */

for (const sort of [desc("createdAt"), asc("createdAt")]) {
  indexes.push(
    idx("contacts", asc("status"), sort),
    idx("contacts", arr("searchKeywords"), asc("status"), sort),
  );
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

for (const sort of [desc("createdAt"), asc("createdAt")]) {
  indexes.push(idx("notifications", asc("status"), sort));
}

indexes.push(idx("notifications", asc("status"), asc("scheduledFor")));

/* -------------------------------------------------------------------------- */
/* Certificates                                                               */
/* -------------------------------------------------------------------------- */

indexes.push(
  idx("certificates", asc("status"), desc("issuedAt")),
  idx("certificates", asc("status"), asc("issuedAt")),
);

/* -------------------------------------------------------------------------- */
/* User Notifications                                                         */
/* -------------------------------------------------------------------------- */

indexes.push(idx("userNotifications", asc("userId"), desc("createdAt")));

/* -------------------------------------------------------------------------- */
/* Coupon Redemptions                                                         */
/* -------------------------------------------------------------------------- */

indexes.push(idx("couponRedemptions", asc("status"), asc("createdAt")));

/* -------------------------------------------------------------------------- */
/* Coupons                                                                    */
/* -------------------------------------------------------------------------- */

for (const sort of [desc("createdAt"), asc("createdAt")]) {
  indexes.push(
    idx("coupons", asc("status"), sort),
    idx("coupons", asc("code"), sort),
  );
}

indexes.push(
  idx("coupons", asc("status"), asc("code")),
  idx("coupons", asc("status"), desc("createdAt")),
  idx("coupons", asc("status"), asc("createdAt")),
);

/* -------------------------------------------------------------------------- */
/* Additional Blog / Jobs / Reviews indexes                                   */
/* -------------------------------------------------------------------------- */

for (const sort of [desc("createdAt"), asc("createdAt")]) {
  for (const field of ["category", "featured"]) {
    indexes.push(idx("blogPosts", asc("status"), asc(field), sort));
  }

  for (const field of [
    "employmentType",
    "experienceLevel",
    "remote",
    "featured",
  ]) {
    indexes.push(idx("jobs", asc("status"), asc(field), sort));
  }

  for (const field of ["courseSlug", "rating"]) {
    indexes.push(idx("reviews", asc("status"), asc(field), sort));
  }
}

for (const sort of [
  desc("createdAt"),
  asc("createdAt"),
  desc("rating"),
  asc("rating"),
]) {
  indexes.push(idx("reviews", asc("status"), sort));
}

indexes.push(
  // Cron / scheduled and expiration queries.
  idx("blogPosts", asc("status"), asc("scheduledFor")),
  idx("jobs", asc("status"), asc("expiresAt")),

  // Rating aggregates.
  idx("reviews", asc("courseId"), asc("status"), asc("rating")),
  idx("reviews", asc("instructorId"), asc("status"), asc("rating")),

  // Public review queries.
  idx("reviews", asc("status"), asc("courseId"), desc("createdAt")),
  idx("reviews", asc("status"), asc("instructorId"), desc("createdAt")),

  // Explicit ascending publishedAt query.
  idx("blogPosts", asc("status"), asc("publishedAt")),
);

/* -------------------------------------------------------------------------- */
/* Audit Logs                                                                 */
/* -------------------------------------------------------------------------- */

indexes.push(
  idx("auditLogs", asc("resource"), desc("createdAt")),
  idx("auditLogs", asc("actorId"), desc("createdAt")),
);

/* -------------------------------------------------------------------------- */
/* Remove duplicate indexes                                                    */
/* -------------------------------------------------------------------------- */

const uniqueIndexes = [
  ...new Map(indexes.map((index) => [JSON.stringify(index), index])).values(),
];

/* -------------------------------------------------------------------------- */
/* Generate firestore.indexes.json                                             */
/* -------------------------------------------------------------------------- */

writeFileSync(
  "firestore.indexes.json",
  JSON.stringify(
    {
      indexes: uniqueIndexes,
      fieldOverrides: [],
    },
    null,
    2,
  ),
);

console.log(
  `Wrote ${uniqueIndexes.length} unique indexes to firestore.indexes.json`,
);
