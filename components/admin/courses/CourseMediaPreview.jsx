"use client";

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ExternalLink, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  extractYouTubeId,
  isHttpUrl,
  youtubeThumbnail,
} from "@/lib/utils/youtube";

/**
 * Live preview of the course media inputs.
 * videoUrl: YouTube link or ID, thumbnailUrl: custom image, externalUrl: online link.
 */
export function CourseMediaPreview({ videoUrl, thumbnailUrl, externalUrl }) {
  const reduce = useReducedMotion();
  const [broken, setBroken] = useState(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), {
    stiffness: 180,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), {
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
  const link = isHttpUrl(externalUrl) ? String(externalUrl).trim() : null;
  const invalidVideo = String(videoUrl ?? "").trim() && !id;

  return (
    <div className="space-y-3">
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
        <Card className="overflow-hidden p-0">
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
              <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                No thumbnail yet
              </div>
            )}
            {id && (
              <span
                className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-primary shadow-lg"
                style={{ transform: "translate(-50%, -50%) translateZ(30px)" }}
                aria-hidden="true"
              >
                <Play className="size-6 fill-current" />
              </span>
            )}
          </div>
        </Card>
      </motion.div>

      <div className="space-y-1 text-sm" aria-live="polite">
        {id && (
          <p className="text-muted-foreground">
            YouTube video ID: <span className="font-mono">{id}</span>
          </p>
        )}
        {invalidVideo && (
          <p className="text-destructive">
            That doesn&apos;t look like a YouTube link or video ID.
          </p>
        )}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Open online link
          </a>
        )}
      </div>
    </div>
  );
}
