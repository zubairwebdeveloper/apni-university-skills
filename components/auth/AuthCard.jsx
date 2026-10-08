// components/auth/AuthCard.jsx (server component)
export function AuthCard({ title, description, footer, children }) {
  return (
    <div>
      <h1 className="text-3xl">{title}</h1>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-8">{children}</div>
      {footer && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}

