// components/admin/instructors/InstructorRecordActions.jsx
"use client";
import { RowActions } from "@/components/admin/table/RowActions";
import { lifecycleItems } from "@/components/admin/table/lifecycle";
import { runInstructorAction } from "@/app/actions/admin/instructors";
export function InstructorRecordActions({ record, perms }) {
  return (
    <RowActions
      label={record.name}
      items={lifecycleItems({
        row: record,
        perms,
        prefix: "instructors",
        noun: "Instructor",
        run: runInstructorAction,
      })}
    />
  );
}

