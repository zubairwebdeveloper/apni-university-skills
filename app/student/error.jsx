// app/student/error.jsx
"use client";
import { RouteError } from "@/components/shared/RouteError";
export default function StudentError(props) {
  return <RouteError title="We couldn't load this page" {...props} />;
}

