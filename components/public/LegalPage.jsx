// components/public/LegalPage.jsx
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { LEGAL_UPDATED } from "@/config/legal";

export function LegalPage({ title, crumb = title, intro, sections }) {
  return (
    <>
      <PageHeader
        title={title}
        description={`Last updated ${LEGAL_UPDATED}`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: crumb }]}
      />
      <Container className="max-w-3xl py-10">
        {intro && <p className="mb-8 text-muted-foreground">{intro}</p>}
        <div className="space-y-8">
          {sections.map((s) => (
            <section
              key={s.heading}
              aria-labelledby={`l-${s.heading.replace(/\W+/g, "-")}`}
            >
              <h2
                id={`l-${s.heading.replace(/\W+/g, "-")}`}
                className="mb-3 text-xl"
              >
                {s.heading}
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}

