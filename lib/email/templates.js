// lib/email/templates.js: every dynamic value is HTML-escaped; user text never reaches a header or subject
const esc = (s = "") =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

function build(site, subject, title, lines, cta) {
  const html =
    `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:24px;color:#1a1a2e"><h1 style="font-size:20px">${esc(title)}</h1>` +
    lines
      .map(
        (l) => `<p style="line-height:1.55;white-space:pre-line">${esc(l)}</p>`,
      )
      .join("") +
    (cta
      ? `<p><a href="${esc(cta.url)}" style="display:inline-block;background:#2f4fc4;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">${esc(cta.label)}</a></p>`
      : "") +
    `<p style="color:#667;font-size:12px;margin-top:32px">${esc(site.siteName)}</p></div>`;
  const text = [
    title,
    "",
    ...lines,
    cta ? `\n${cta.label}: ${cta.url}` : "",
    `\n${site.siteName}`,
  ].join("\n");
  return { subject, html, text };
}

export const templates = {
  welcome: (d, s) =>
    build(
      s,
      `Welcome to ${s.siteName}`,
      `Welcome, ${d.name || "there"}!`,
      [
        "Your account is ready. Start with a free course or explore the catalog.",
      ],
      { label: "Browse courses", url: `${s.url}/courses` },
    ),
  enrollment: (d, s) =>
    build(
      s,
      `You're enrolled: ${d.course}`,
      "You're enrolled",
      [`You now have access to “${d.course}”.`],
      { label: "Start learning", url: d.url },
    ),
  payment: (d, s) =>
    build(
      s,
      `Payment received: ${d.course}`,
      "Payment received",
      [
        `Thanks, ${d.name || "there"}. We received ${d.amount} for “${d.course}”.`,
        `Reference: ${d.ref}`,
      ],
      { label: "View payments", url: `${s.url}/student/payments` },
    ),
  completion: (d, s) =>
    build(
      s,
      `Course completed: ${d.course}`,
      "Course completed",
      [`Congratulations, ${d.name || "there"}! You finished “${d.course}”.`],
      { label: "View certificates", url: d.url },
    ),
  certificate: (d, s) =>
    build(
      s,
      `Your certificate: ${d.course}`,
      "Your certificate is ready",
      [
        `Your certificate for “${d.course}” has been issued. Anyone can verify it with the link below.`,
      ],
      { label: "Verify certificate", url: d.url },
    ),
  announcement: (d, s) =>
    build(
      s,
      d.title,
      d.title,
      [d.body],
      d.url ? { label: "Open", url: d.url } : null,
    ),
  contact: (d, s) =>
    build(
      s,
      "New contact message",
      "New contact message",
      [`From: ${d.name} <${d.email}>`, `Subject: ${d.subject}`, d.message],
      { label: "Open messages", url: `${s.url}/admin/contacts` },
    ),
  jobApplication: (d, s) =>
    build(
      s,
      "New job application",
      "New job application",
      [`${d.name} applied for ${d.job}.`],
      null,
    ), // defined for later; jobs link out today
};

