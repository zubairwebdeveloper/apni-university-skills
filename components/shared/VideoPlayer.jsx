// components/shared/VideoPlayer.jsx: https only; embeds are allow-listed, everything else plays as <video>
const YT = /^[\w-]{11}$/;

function resolve(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id =
        u.searchParams.get("v") ??
        u.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/)?.[1];
      return id && YT.test(id)
        ? { iframe: `https://www.youtube-nocookie.com/embed/${id}` }
        : null;
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return YT.test(id)
        ? { iframe: `https://www.youtube-nocookie.com/embed/${id}` }
        : null;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return /^\d+$/.test(id)
        ? { iframe: `https://player.vimeo.com/video/${id}` }
        : null;
    }
    return { video: u.toString() };
  } catch {
    return null;
  }
}

export function VideoPlayer({ url, title }) {
  const src = resolve(url);
  if (!src)
    return (
      <div className="grid aspect-video place-items-center rounded-xl bg-muted text-sm text-muted-foreground">
        Video unavailable
      </div>
    );
  return (
    <div className="aspect-video overflow-hidden rounded-xl bg-black">
      {src.iframe ? (
        <iframe
          src={src.iframe}
          title={title}
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="size-full"
        />
      ) : (
        <video
          src={src.video}
          controls
          preload="metadata"
          controlsList="nodownload"
          className="size-full"
        />
      )}
    </div>
  );
}

