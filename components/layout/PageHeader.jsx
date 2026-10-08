// components/layout/PageHeader.jsx
import { Container } from "./Container";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

export function PageHeader({
  id = "page-title",
  title,
  description,
  breadcrumbs,
  children,
}) {
  return (
    <div className="border-b bg-secondary/40">
      <Container className="py-10 sm:py-14">
        {breadcrumbs && (
          <div className="mb-4">
            <PageBreadcrumbs items={breadcrumbs} />
          </div>
        )}
        <h1 id={id} className="text-3xl sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
        )}
        {children}
      </Container>
    </div>
  );
}

