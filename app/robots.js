// app/robots.js
export default function robots() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://apni-university-skills-lurc.vercel.app/";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/student/",
          "/admin/",
          "/api/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

