// components/shared/RouteError.jsx

"use client";

import { useEffect } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { ErrorState } from "./ErrorState";

export function RouteError({ error, reset, title = "Something went wrong" }) {
  useEffect(() => {
    console.error("[RouteError]", error);
  }, [error]);

  return (
    <Container className="py-20">
      <ErrorState title={title} onRetry={reset} />

      <p className="mt-4 text-center">
        <Link
          href="/"
          className={buttonVariants({
            variant: "ghost",
          })}
        >
          Back to home
        </Link>
      </p>
    </Container>
  );
}
