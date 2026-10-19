// components/student/StudentPageHeader.jsx
import { cn } from "@/lib/utils";

export function StudentPageHeader({
  title,
  description,
  children,
  eyebrow,
  icon: Icon,
  className,
}) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pb-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
        {Icon && (
          <span
            aria-hidden="true"
            className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-violet-700 dark:text-violet-300 sm:size-12"
          >
            <Icon className="size-5 sm:size-[22px]" />
          </span>
        )}

        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">
              <span
                aria-hidden="true"
                className="h-3.5 w-[3px] shrink-0 rounded-full bg-[#FACC15]"
              />
              <span className="truncate">{eyebrow}</span>
            </p>
          )}

          <h1 className="text-balance text-2xl font-extrabold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-3xl">
            {title}
          </h1>

          {description && (
            <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              {description}
            </p>
          )}
        </div>
      </div>

      {children && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {children}
        </div>
      )}
    </header>
  );
}

export default StudentPageHeader;
