// The hero GIF host is read from the env var, so swapping the GIF never needs a code change.
const heroHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_HOME_HERO_GIF_URL).hostname;
  } catch {
    return null;
  }
})();

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "media.giphy.com" },
      ...(heroHost ? [{ protocol: "https", hostname: heroHost }] : []),
    ],
  },
};
export default nextConfig;
