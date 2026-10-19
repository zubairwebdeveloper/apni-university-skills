// components/shared/RouteError.jsx

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import { ErrorState } from "./ErrorState";

export function RouteError({ error, reset, title = "Something went wrong" }) {
  useEffect(() => {
    console.error("[RouteError]", error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] items-center py-20">
      <div className="w-full">
        <ErrorState title={title} onRetry={reset} />

        <p className="mt-4 text-center">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "group gap-1.5",
            )}
          >
            <ArrowLeft
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            Back to home
          </Link>
        </p>
      </div>
    </Container>
  );
}
