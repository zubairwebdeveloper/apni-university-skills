// app/admin/error.jsx
"use client";
import { RouteError } from "@/components/shared/RouteError";
export default function AdminError(props) {
  return <RouteError title="This admin page couldn't load" {...props} />;
}

