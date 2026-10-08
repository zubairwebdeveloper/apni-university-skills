// components/shared/Paragraphs.jsx: plain text only, never HTML
export function Paragraphs({ text, className = "" }) {
  const parts = String(text ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div
      className={`space-y-4 leading-relaxed text-muted-foreground ${className}`}
    >
      {parts.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

