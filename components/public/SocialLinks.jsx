// components/public/SocialLinks.jsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  FaGithub,
  FaGlobe,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { safeExternalUrl } from "@/lib/utils/url";
import Link from "next/link";

const META = {
  linkedin: ["LinkedIn", FaLinkedinIn],
  github: ["GitHub", FaGithub],
  x: ["X", FaXTwitter],
  twitter: ["X", FaXTwitter],
  youtube: ["YouTube", FaYoutube],
  website: ["Website", FaGlobe],
};

export function SocialLinks({ links = {}, name }) {
  const reduce = useReducedMotion();
  const items = Object.entries(links)
    .map(([k, v]) => [k, safeExternalUrl(v)])
    .filter(([k, url]) => url && META[k]);
  if (!items.length) return null;

  return (
    <ul className="flex gap-2">
      {items.map(([k, url], i) => {
        const [label, Icon] = META[k];
        return (
          <motion.li
            key={k}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: i * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} on ${label}`}
              title={label}
              className="group grid size-9 place-items-center rounded-md border bg-background text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-sm focus-visible:-translate-y-0.5 focus-visible:border-primary/40 focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Icon
                className="size-4 transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              />
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}
