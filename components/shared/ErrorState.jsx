// components/shared/ErrorState.jsx
import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again in a moment.",
  onRetry,
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-destructive/25 bg-card px-6 py-12 text-center sm:py-14"
    >
      <span className="grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5">
        <FiAlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-balance font-serif text-lg font-semibold text-foreground sm:text-xl">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-pretty text-sm text-muted-foreground sm:text-base">
        {description}
      </p>
      {onRetry && (
        <Button type="button" size="lg" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
