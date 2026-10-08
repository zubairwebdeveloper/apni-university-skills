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
      className="flex flex-col items-center rounded-xl border bg-card px-6 py-12 text-center"
    >
      <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <FiAlertTriangle className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-serif text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {onRetry && (
        <Button type="button" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

