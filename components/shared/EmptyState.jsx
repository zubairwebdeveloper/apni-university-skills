// components/shared/EmptyState.jsx
import { FiInbox } from "react-icons/fi";
import { FadeIn } from "./FadeIn";

export function EmptyState({
  icon: Icon = FiInbox,
  title,
  description,
  action,
}) {
  return (
    <FadeIn className="flex flex-col items-center rounded-xl border border-dashed bg-card px-6 py-12 text-center">
      <span className="relative grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-primary/10"
        />
        <Icon className="relative size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </FadeIn>
  );
}
