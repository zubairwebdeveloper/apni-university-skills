// AIMarkdown.jsx
"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AICodeBlock } from "./AICodeBlock";

const SAFE_HREF = /^(https?:\/\/|\/(?!\/)|#|mailto:)/i;

// No rehype-raw: model HTML is never rendered, only Markdown
const components = {
  p: (props) => (
    <p className="my-2 leading-7 first:mt-0 last:mb-0" {...props} />
  ),
  ul: (props) => <ul className="my-2 list-disc space-y-1 pl-5" {...props} />,
  ol: (props) => <ol className="my-2 list-decimal space-y-1 pl-5" {...props} />,
  li: (props) => <li className="leading-7" {...props} />,
  h1: (props) => (
    <h3 className="mb-2 mt-4 text-base font-semibold" {...props} />
  ),
  h2: (props) => (
    <h3 className="mb-2 mt-4 text-base font-semibold" {...props} />
  ),
  h3: (props) => (
    <h4 className="mb-1.5 mt-3 text-sm font-semibold" {...props} />
  ),
  blockquote: (props) => (
    <blockquote
      className="my-3 border-l-2 pl-3 text-muted-foreground"
      {...props}
    />
  ),
  table: (props) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="border-b px-3 py-2 text-left font-semibold" {...props} />
  ),
  td: (props) => <td className="border-b px-3 py-2 align-top" {...props} />,
  a: ({ href, children }) =>
    href && SAFE_HREF.test(href) ? (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="font-medium text-primary underline underline-offset-4"
      >
        {children}
      </a>
    ) : (
      <span>{children}</span>
    ),
  pre: ({ children }) => <AICodeBlock>{children}</AICodeBlock>,
  code: ({ className, children, ...rest }) => {
    const block =
      /language-/.test(className ?? "") || String(children).includes("\n");
    return block ? (
      <code className={className} {...rest}>
        {children}
      </code>
    ) : (
      <code
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]"
        {...rest}
      >
        {children}
      </code>
    );
  },
};

export const AIMarkdown = memo(function AIMarkdown({ children }) {
  return (
    <div className="text-sm [overflow-wrap:anywhere]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
});
