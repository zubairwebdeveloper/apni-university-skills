// app/error.jsx
"use client";
import { RouteError } from "@/components/shared/RouteError";
export default function RootError(props) {
  return <RouteError title="Something went wrong" {...props} />;
}

