// Decorative page backdrop. Fully static: no client JS, no animation.

const RINGS = [
  { size: 520, opacity: 0.18 },
  { size: 380, opacity: 0.26 },
  { size: 240, opacity: 0.36 },
];

const FADE_MASK =
  "radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 75%)";

export function LearningBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Soft ambient light */}
      <div className="absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />

      {/* Fine grid, fading out toward the bottom */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: FADE_MASK,
          WebkitMaskImage: FADE_MASK,
        }}
      />

      {/* Orbit rings: static, hidden on small screens */}
      <div
        className="absolute right-[-120px] top-[-60px] hidden h-[520px] w-[520px] md:block lg:right-[4%]"
        style={{ perspective: 1100 }}
      >
        {RINGS.map((r) => (
          <span
            key={r.size}
            className="absolute left-1/2 top-1/2 rounded-full border border-primary"
            style={{
              width: r.size,
              height: r.size,
              marginLeft: -r.size / 2,
              marginTop: -r.size / 2,
              opacity: r.opacity,
              transform: "rotateX(68deg)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
