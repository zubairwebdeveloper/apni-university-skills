// lib/email/provider.js
import "server-only";
const providers = {
  none: {
    async send(m) {
      console.info("[email:none]", m.template, "->", m.to);
      return { id: null };
    },
  },
  resend: {
    async send({ to, from, subject, html, text }) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to: [to], subject, html, text }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
      return { id: (await res.json()).id };
    },
  },
};
export const getProvider = () =>
  Object.hasOwn(providers, process.env.EMAIL_PROVIDER)
    ? providers[process.env.EMAIL_PROVIDER]
    : providers.none;

