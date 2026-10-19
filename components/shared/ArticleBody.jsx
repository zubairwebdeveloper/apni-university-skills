// components/shared/ArticleBody.jsx
// Plain-text markup, never HTML: one paragraph per line; "## " / "### " headings; "- " bullets.
function parse(text) {
  const blocks = [];
  let list = null;
  for (const raw of String(text ?? "").split("\n")) {
    const line = raw.trim();
    if (!line) {
      list = null;
      continue;
    }
    if (line.startsWith("### ")) {
      list = null;
      blocks.push({ t: "h3", v: line.slice(4) });
    } else if (line.startsWith("## ")) {
      list = null;
      blocks.push({ t: "h2", v: line.slice(3) });
    } else if (/^[-*] /.test(line)) {
      if (!list) {
        list = { t: "ul", v: [] };
        blocks.push(list);
      }
      list.v.push(line.slice(2));
    } else {
      list = null;
      blocks.push({ t: "p", v: line });
    }
  }
  return blocks;
}

export function ArticleBody({ text }) {
  const blocks = parse(text);

  return (
    <div className="mx-auto max-w-[68ch] text-[1.0625rem] leading-[1.8] text-foreground/85">
      {blocks.map((b, i) =>
        b.t === "h2" ? (
          <h2
            key={i}
            className="scroll-mt-28 text-balance border-t pt-8 font-serif text-2xl font-semibold leading-snug text-foreground first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-12 mb-4 sm:text-[1.75rem]"
          >
            {b.v}
          </h2>
        ) : b.t === "h3" ? (
          <h3
            key={i}
            className="scroll-mt-28 text-balance mb-3 mt-10 text-xl font-semibold leading-snug text-foreground"
          >
            {b.v}
          </h3>
        ) : b.t === "ul" ? (
          <ul key={i} className="my-5 space-y-2.5 pl-1">
            {b.v.map((x, j) => (
              <li key={j} className="relative pl-6">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-[0.7em] size-1.5 rounded-full bg-primary/70"
                />
                {x}
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} className="my-5 text-pretty">
            {b.v}
          </p>
        ),
      )}
    </div>
  );
}
