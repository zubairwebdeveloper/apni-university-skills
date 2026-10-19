import { cn } from "@/lib/utils";

export function Container({
  className,
  size = "default",
  as: Component = "div",
  fluid = false,
  children,
  ...props
}) {
  const sizes = {
    narrow: "max-w-3xl",
    content: "max-w-5xl",
    default: "max-w-7xl",
    wide: "max-w-[90rem]",
    full: "max-w-none",
  };

  return (
    <Component
      className={cn(
        "mx-auto w-full",
        !fluid && (sizes[size] || sizes.default),
        "px-4 sm:px-6 lg:px-8",
        "min-w-0",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Section({
  id,
  labelledBy,
  className,
  containerClassName,
  children,
  as: Component = "section",
  container = true,
  size = "default",
  spacing = "default",
  ...props
}) {
  const spacingClasses = {
    none: "py-0",
    compact: "py-8 sm:py-10 lg:py-12",
    default: "py-12 sm:py-16 lg:py-20",
    spacious: "py-16 sm:py-20 lg:py-28",
  };

  const content = container ? (
    <Container size={size} className={containerClassName}>
      {children}
    </Container>
  ) : (
    children
  );

  return (
    <Component
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "relative w-full min-w-0",
        spacingClasses[spacing] || spacingClasses.default,
        className,
      )}
      {...props}
    >
      {content}
    </Component>
  );
}
