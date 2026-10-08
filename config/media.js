export const mediaConfig = {
  heroGif:
    process.env.NEXT_PUBLIC_HOME_HERO_GIF_URL ||
    "/images/hero/hero-fallback.gif", // local fallback so the hero never breaks if the remote host dies
};

