// app/(public)/courses/error.jsx
"use client";
import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { ErrorState } from "@/components/shared/ErrorState";

export default function CoursesError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <Container className="py-20">
      <ErrorState
        title="We couldn't load courses"
        description="This is usually temporary. Please try again."
        onRetry={reset}
      />
    </Container>
  );
}

