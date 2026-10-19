// components/public/LegalPage.jsx
import Link from "next/link";
import { FiArrowRight, FiArrowUp, FiList } from "react-icons/fi";

import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { LEGAL_UPDATED } from "@/config/legal";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Builds unique, stable anchor ids. Two sections with the same heading
// would otherwise share an id, which breaks links and aria-labelledby.
function buildIds(sections) {
  const seen = new Map();
  return sections.map((s) => {
    const base = `l-${String(s.heading).replace(/\W+/g, "-")}`;
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n === 0 ? base : `${base}-${n + 1}`;
  });
}

function TocList({ items }) {
  return (
    <ol className="space-y-0.5">
      {items.map(({ id, heading }, i) => (
        <li key={id}>
          <a
            href={`#${id}`}
            className={cn(
              "group flex items-baseline gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              FOCUS_RING,
            )}
          >
            <span
              aria-hidden="true"
              className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground/70 group-hover:text-primary"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0">{heading}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export function LegalPage({ title, crumb = title, intro, sections = [] }) {
  const ids = buildIds(sections);
  const toc = sections.map((s, i) => ({ id: ids[i], heading: s.heading }));
  const showToc = sections.length > 2;

  return (
    <>
      <PageHeader
        title={title}
        description={`Last updated ${LEGAL_UPDATED}`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: crumb }]}
      />

      <Container className="max-w-5xl py-10 sm:py-14">
        <div id="legal-top" className="scroll-mt-24" />

        <div
          className={cn(
            "grid gap-8 lg:gap-12",
            showToc && "lg:grid-cols-[14rem_minmax(0,1fr)]",
          )}
        >
          {/* Table of contents: collapsible on small screens, sticky on large */}
          {showToc && (
            <aside className="print:hidden lg:order-first">
              <details className="group rounded-xl border bg-card lg:hidden">
                <summary
                  className={cn(
                    "flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden",
                    FOCUS_RING,
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <FiList
                      aria-hidden="true"
                      className="size-4 text-primary"
                    />
                    On this page
                  </span>
                  <span className="text-xs text-muted-foreground group-open:hidden">
                    Show
                  </span>
                  <span className="hidden text-xs text-muted-foreground group-open:inline">
                    Hide
                  </span>
                </summary>
                <nav
                  aria-label="Table of contents"
                  className="border-t px-2 py-2"
                >
                  <TocList items={toc} />
                </nav>
              </details>

              <nav
                aria-label="Table of contents"
                className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block"
              >
                <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  On this page
                </p>
                <TocList items={toc} />
              </nav>
            </aside>
          )}

          {/* Document */}
          <article className="min-w-0 max-w-3xl">
            {intro && (
              <p className="mb-10 border-l-2 border-primary/40 pl-5 text-base leading-relaxed text-foreground/80 sm:text-lg">
                {intro}
              </p>
            )}

            <div className="divide-y">
              {sections.map((s, i) => (
                <section
                  key={ids[i]}
                  id={ids[i]}
                  aria-labelledby={`${ids[i]}-h`}
                  className="scroll-mt-24 py-8 first:pt-0 last:pb-0"
                >
                  <h2
                    id={`${ids[i]}-h`}
                    className="mb-4 flex items-baseline gap-3 font-serif text-xl font-semibold leading-snug tracking-tight sm:text-2xl"
                  >
                    <span
                      aria-hidden="true"
                      className="text-sm font-medium tabular-nums text-primary"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">{s.heading}</span>
                  </h2>
                  <div className="space-y-4 text-[15px] leading-7 text-muted-foreground sm:pl-9">
                    {(s.body ?? []).map((p, n) => (
                      <p key={n}>{p}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-12 flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 print:hidden">
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  Questions about this page?
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Last updated {LEGAL_UPDATED}.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/contact"
                  className={cn(
                    "group inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline",
                    FOCUS_RING,
                  )}
                >
                  Contact us
                  <FiArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5"
                  />
                </Link>
                <a
                  href="#legal-top"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground",
                    FOCUS_RING,
                  )}
                >
                  <FiArrowUp aria-hidden="true" className="size-4" />
                  Back to top
                </a>
              </div>
            </div>
          </article>
        </div>
      </Container>
    </>
  );
}
