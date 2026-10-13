"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { Card } from "@/components/ui/card";
import { isHttpUrl } from "@/lib/utils/youtube";

const SOCIAL_LABELS = {
  linkedin: "LinkedIn",
  github: "GitHub",
  x: "X",
  youtube: "YouTube",
  website: "Website",
};

function initials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return (
    parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")
  ).toUpperCase();
}

const list = (text) =>
  String(text ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

/** Live preview of an instructor profile. Pure display, reads form values. */
export function InstructorPreview({ values }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), {
    stiffness: 180,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), {
    stiffness: 180,
    damping: 24,
  });

  function move(e) {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }

  const avatar = isHttpUrl(values.avatar) ? values.avatar : null;
  const cover = isHttpUrl(values.coverImage) ? values.coverImage : null;
  const expertise = list(values.expertise).slice(0, 5);
  const socials = Object.entries(values.socialLinks ?? {}).filter(([, v]) =>
    isHttpUrl(v),
  );

  return (
    <motion.div
      className="max-w-xl"
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <Card className="gap-0 overflow-hidden p-0">
        <div className="h-24 bg-muted">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              className="size-full object-cover"
              loading="lazy"
            />
          )}
        </div>
        <div className="px-6 pb-6">
          <span
            className="-mt-10 flex size-20 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xl font-semibold text-primary ring-4 ring-card"
            style={{ transform: "translateZ(28px)" }}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt=""
                className="size-full object-cover"
                loading="lazy"
              />
            ) : (
              initials(values.name)
            )}
          </span>
          <p className="mt-3 text-xs text-muted-foreground">Live preview</p>
          <p className="text-lg font-medium">
            {values.name || "Instructor name"}
          </p>
          {values.designation && (
            <p className="text-sm text-muted-foreground">
              {values.designation}
            </p>
          )}
          {values.shortBio && (
            <p className="mt-3 text-sm leading-relaxed">{values.shortBio}</p>
          )}
          {expertise.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Expertise">
              {expertise.map((t) => (
                <li
                  key={t}
                  className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
          {socials.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-3 text-xs">
              {socials.map(([k, v]) => (
                <li key={k}>
                  <a
                    href={v}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {SOCIAL_LABELS[k] ?? k}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
