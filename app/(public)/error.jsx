// app/(public)/error.jsx: renders inside the public layout, so the navbar and footer stay visible
"use client";
import { RouteError } from "@/components/shared/RouteError";
export default function PublicError(props) {
  return <RouteError title="We couldn't load this page" {...props} />;
}

