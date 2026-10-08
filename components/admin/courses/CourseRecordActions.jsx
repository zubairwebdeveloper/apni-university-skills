// components/admin/courses/CourseRecordActions.jsx
"use client";
import { FiCopy, FiStar } from "react-icons/fi";
import { RowActions } from "@/components/admin/table/RowActions";
import { lifecycleItems } from "@/components/admin/table/lifecycle";
import {
  duplicateCourse,
  runCourseAction,
  setCourseFeatured,
} from "@/app/actions/admin/courses";

export function CourseRecordActions({ record, perms }) {
  const live = record.status !== "deleted";
  return (
    <RowActions
      label={record.title}
      items={[
        {
          key: "duplicate",
          label: "Duplicate",
          icon: FiCopy,
          hidden: !perms.includes("courses.create") || !live,
          run: () => duplicateCourse({ slug: record.slug }),
          success: "Course duplicated as a draft.",
        },
        {
          key: "feature",
          label: record.featured ? "Remove featured" : "Feature",
          icon: FiStar,
          hidden: !perms.includes("courses.update") || !live,
          run: () =>
            setCourseFeatured({
              slug: record.slug,
              featured: !record.featured,
            }),
          success: record.featured
            ? "Course is no longer featured."
            : "Course featured successfully.",
        },
        ...lifecycleItems({
          row: record,
          perms,
          prefix: "courses",
          noun: "Course",
          run: runCourseAction,
        }),
      ]}
    />
  );
}

