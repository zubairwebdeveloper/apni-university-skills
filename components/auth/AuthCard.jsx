// components/auth/AuthCard.jsx (server component)
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AuthCard({ title, description, footer, children, className }) {
  return (
    <Card
      className={cn(
        "w-full max-w-sm border-border/60 p-8 shadow-sm sm:p-10",
        className,
      )}
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="mt-8">{children}</div>

      {footer && (
        <div className="mt-6 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </Card>
  );
}
