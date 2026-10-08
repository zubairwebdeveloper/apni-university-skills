// lib/admin/aggregates.js

// dashboardService imports these and drops its local copies

import "server-only";

import { AggregateField } from "firebase-admin/firestore";

export const count = async (q) =>
  (await q.count().get()).data().count;

export const sum = async (q, field) =>
  (
    await q
      .aggregate({
        total: AggregateField.sum(field),
      })
      .get()
  ).data().total ?? 0;

export async function gather(tasks) {
  const keys = Object.keys(tasks);

  const settled = await Promise.allSettled(
    keys.map((key) => tasks[key]()),
  );

  return Object.fromEntries(
    keys.map((key, index) => {
      const result = settled[index];

      if (result.status === "rejected") {
        console.error(
          `[aggregate] ${key}:`,
          result.reason?.message ??
            result.reason,
        );
      }

      return [
        key,
        result.status === "fulfilled"
          ? result.value
          : null,
      ];
    }),
  );
}
