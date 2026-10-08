// components/shared/JsonLd.jsx
export function JsonLd({ data }) {
  // "<" is escaped so content can never close the script tag
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

