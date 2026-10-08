import { cn } from "@/lib/utils";

export function Container({ className, children, ...props }) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Section({
  className,
  children,
  as: Tag = "section",
  ...props
}) {
  return (
    <Tag className={cn("py-16 sm:py-20 lg:py-24", className)} {...props}>
      <Container>{children}</Container>
    </Tag>
  );
}

export default Container;

