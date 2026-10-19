"use client";

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { AlertCircle, ExternalLink, ImageOff, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  extractYouTubeId,
  isHttpUrl,
  youtubeThumbnail,
} from "@/lib/utils/youtube";

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Live preview of the course media inputs.
 * videoUrl: YouTube link or ID, thumbnailUrl: custom image, externalUrl: online link.
 */
export function CourseMediaPreview({ videoUrl, thumbnailUrl, externalUrl }) {
  const reduce = useReducedMotion();
  const [broken, setBroken] = useState(null);
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

  const id = extractYouTubeId(videoUrl);
  const custom = isHttpUrl(thumbnailUrl) ? String(thumbnailUrl).trim() : null;
  const image = custom ?? youtubeThumbnail(id);
  const showImage = image && broken !== image;
  const imageFailed = image && broken === image;
  const link = isHttpUrl(externalUrl) ? String(externalUrl).trim() : null;
  const invalidVideo = String(videoUrl ?? "").trim() && !id;

  return (
    <div className="min-w-0 space-y-4">
      <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <span
          aria-hidden="true"
          className="h-3.5 w-1 rounded-full bg-[#FACC15]"
        />
        Live preview
      </p>

      <motion.div
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
        <Card className="overflow-hidden p-0 shadow-sm">
          <div className="relative aspect-video bg-muted">
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt="Course video thumbnail"
                loading="lazy"
                className="size-full object-cover"
                onError={() => setBroken(image)}
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 px-4 text-center">
                <span
                  aria-hidden="true"
                  className="grid size-10 place-items-center rounded-full bg-background/70 text-muted-foreground ring-1 ring-border"
                >
                  <ImageOff className="size-5" />
                </span>
                <p className="text-sm text-muted-foreground">
                  {imageFailed
                    ? "This image couldn't be loaded."
                    : "No thumbnail yet"}
                </p>
              </div>
            )}
            {id && (
              <span
                className="absolute left-1/2 top-1/2 grid size-14 place-items-center rounded-full bg-background/90 text-primary shadow-lg ring-1 ring-border"
                style={{ transform: "translate(-50%, -50%) translateZ(30px)" }}
                aria-hidden="true"
              >
                <Play className="size-6 fill-current" />
              </span>
            )}
          </div>
        </Card>
      </motion.div>

      <div className="space-y-2 text-sm" aria-live="polite">
        {id && (
          <p className="flex flex-wrap items-center gap-2 text-muted-foreground">
            YouTube video ID
            <span className="rounded-md border bg-muted/50 px-2 py-0.5 font-mono text-xs text-foreground">
              {id}
            </span>
          </p>
        )}
        {invalidVideo && (
          <p className="flex items-start gap-2 text-destructive">
            <AlertCircle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>That doesn&apos;t look like a YouTube link or video ID.</span>
          </p>
        )}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1.5 rounded-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Open online link ({hostOf(link)})</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </div>
  );
}
