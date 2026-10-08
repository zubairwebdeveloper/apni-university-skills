// components/public/SocialLinks.jsx
import {
  FaGithub,
  FaGlobe,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { safeExternalUrl } from "@/lib/utils/url";

const META = {
  linkedin: ["LinkedIn", FaLinkedinIn],
  github: ["GitHub", FaGithub],
  x: ["X", FaXTwitter],
  twitter: ["X", FaXTwitter],
  youtube: ["YouTube", FaYoutube],
  website: ["Website", FaGlobe],
};

export function SocialLinks({ links = {}, name }) {
  const items = Object.entries(links)
    .map(([k, v]) => [k, safeExternalUrl(v)])
    .filter(([k, url]) => url && META[k]);
  if (!items.length) return null;
  return (
    <ul className="flex gap-2">
      {items.map(([k, url]) => {
        const [label, Icon] = META[k];
        return (
          <li key={k}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} on ${label}`}
              className="grid size-9 place-items-center rounded-md border bg-background text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="size-4" aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

