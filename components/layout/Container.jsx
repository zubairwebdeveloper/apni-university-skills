import { cn } from "@/lib/utils";

/**
 * Container
 * Consistent horizontal alignment across the application.
 *
 * Examples:
 * <Container>...</Container>
 * <Container size="wide">...</Container>
 * <Container size="full">...</Container>
 */
const CONTAINER_SIZES = {
  default: "max-w-7xl",
  narrow: "max-w-3xl",
  content: "max-w-4xl",
  wide: "max-w-[1440px]",
  full: "max-w-none",
};

export function Container({
  as: Tag = "div",
  size = "default",
  className,
  children,
  ...props
}) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full",
        "px-4 sm:px-6 lg:px-8",
        CONTAINER_SIZES[size] ?? CONTAINER_SIZES.default,
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Section
 * A reusable semantic section with consistent vertical rhythm.
 *
 * Examples:
 * <Section>...</Section>
 * <Section spacing="compact">...</Section>
 * <Section background="muted">...</Section>
 */
const SECTION_SPACING = {
  none: "py-0",
  compact: "py-10 sm:py-12",
  default: "py-16 sm:py-20 lg:py-24",
  spacious: "py-20 sm:py-24 lg:py-32",
};

const SECTION_BACKGROUNDS = {
  transparent: "bg-transparent",
  muted: "bg-muted/40",
  surface: "bg-card",
  dark: "bg-[#111318] text-white",
};

export function Section({
  as: Tag = "section",
  id,
  className,
  containerClassName,
  containerSize = "default",
  spacing = "default",
  background = "transparent",
  labelledBy,
  children,
  fullWidth = false,
  ...props
}) {
  const spacingClass = SECTION_SPACING[spacing] ?? SECTION_SPACING.default;

  const backgroundClass =
    SECTION_BACKGROUNDS[background] ?? SECTION_BACKGROUNDS.transparent;

  const content = fullWidth ? (
    children
  ) : (
    <Container size={containerSize} className={containerClassName}>
      {children}
    </Container>
  );

  return (
    <Tag
      id={id}
      className={cn(
        "relative w-full",
        spacingClass,
        backgroundClass,
        className,
      )}
      aria-labelledby={labelledBy}
      {...props}
    >
      {content}
    </Tag>
  );
}

export default Container;
