// components/admin/reviews/ReviewRecordActions.jsx
"use client";
import { RowActions } from "@/components/admin/table/RowActions";
import { reviewItems } from "./reviewItems";
import { runReviewAction } from "@/app/actions/admin/reviews";
export function ReviewRecordActions({ record, perms }) {
  return (
    <RowActions
      label={`${record.studentName}'s review`}
      items={reviewItems({ row: record, perms, run: runReviewAction })}
    />
  );
}

