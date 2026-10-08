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
  return (
    <div className="text-base leading-relaxed text-foreground/85">
      {parse(text).map((b, i) =>
        b.t === "h2" ? (
          <h2 key={i} className="mb-3 mt-10 text-2xl">
            {b.v}
          </h2>
        ) : b.t === "h3" ? (
          <h3 key={i} className="mb-2 mt-8 text-xl">
            {b.v}
          </h3>
        ) : b.t === "ul" ? (
          <ul key={i} className="my-4 list-disc space-y-2 pl-6">
            {b.v.map((x, j) => (
              <li key={j}>{x}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="my-4">
            {b.v}
          </p>
        ),
      )}
    </div>
  );
}

