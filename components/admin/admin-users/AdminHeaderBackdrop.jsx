// components/admin/admin-users/AdminHeaderBackdrop.jsx
// Decorative 3D background for admin page headers (pure CSS, server-safe).
//
// Colors: ships with sane brand defaults (blue + yellow, light/dark aware)
// so it looks right with zero setup. An ancestor can still override by
// setting --ea-a / --ea-b (RGB triplets, e.g. "37 99 235") on a closer
// element — that takes precedence over this component's own defaults.
//
// Usage:
//   <header className="relative isolate overflow-hidden ...">
//     <AdminHeaderBackdrop density="rich" />
//     ...actual header content...
//   </header>

const DEFAULT_LIGHT = { a: "37 99 235", b: "245 184 46" }; // blue-600 / brand yellow
const DEFAULT_DARK = { a: "79 140 255", b: "255 200 87" }; // lighter blue / warmer yellow for dark surfaces

// A loose "knowledge graph" — percentages within a 400x200 viewBox.
const NODES = [
  { id: 0, x: 18, y: 38, r: 3.2, accent: false },
  { id: 1, x: 34, y: 20, r: 2.4, accent: false },
  { id: 2, x: 46, y: 52, r: 4, accent: true },
  { id: 3, x: 62, y: 28, r: 2.6, accent: false },
  { id: 4, x: 72, y: 58, r: 2.8, accent: false },
  { id: 5, x: 26, y: 70, r: 2.2, accent: false },
  { id: 6, x: 54, y: 78, r: 2.4, accent: false },
  { id: 7, x: 85, y: 34, r: 2, accent: true },
  { id: 8, x: 8, y: 60, r: 1.8, accent: false },
  { id: 9, x: 92, y: 68, r: 1.8, accent: false },
];
const EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [2, 5],
  [5, 6],
  [3, 7],
  [0, 8],
  [4, 9],
  [6, 4],
];

function densityConfig(density) {
  switch (density) {
    case "subtle":
      return {
        nodeCount: 5,
        grid: false,
        secondCube: false,
        secondRing: false,
      };
    case "rich":
      return { nodeCount: 10, grid: true, secondCube: true, secondRing: true };
    case "normal":
    default:
      return { nodeCount: 7, grid: true, secondCube: false, secondRing: false };
  }
}

function Cube({
  size = 64,
  duration = 28,
  from = [-25, 35],
  accent = false,
  className,
}) {
  const h = size / 2;
  const faces = [
    `rotateY(0deg) translateZ(${h}px)`,
    `rotateY(90deg) translateZ(${h}px)`,
    `rotateY(180deg) translateZ(${h}px)`,
    `rotateY(-90deg) translateZ(${h}px)`,
    `rotateX(90deg) translateZ(${h}px)`,
    `rotateX(-90deg) translateZ(${h}px)`,
  ];
  const faceColorVar = accent ? "--ea-b" : "--ea-a";
  return (
    <div
      className={className}
      style={{ width: size, height: size, perspective: 600 }}
    >
      <div
        className="ea-spin relative size-full"
        style={{
          transformStyle: "preserve-3d",
          animationDuration: `${duration}s`,
          "--rx": `${from[0]}deg`,
          "--ry": `${from[1]}deg`,
          transform: "rotateX(var(--rx)) rotateY(var(--ry))",
        }}
      >
        {faces.map((transform, i) => (
          <span
            key={i}
            className="absolute inset-0 border"
            style={{
              transform,
              borderColor: `rgb(var(${faceColorVar}) / 0.5)`,
              backgroundColor: `rgb(var(${faceColorVar}) / 0.06)`,
            }}
          />
        ))}
        <span
          className="absolute left-1/2 top-1/2 size-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            backgroundColor: `rgb(var(${faceColorVar}))`,
            boxShadow: `0 0 18px 5px rgb(var(${faceColorVar}) / 0.55)`,
          }}
        />
      </div>
    </div>
  );
}

function NodeNetwork({ count }) {
  const nodes = NODES.slice(0, count);
  const ids = new Set(nodes.map((n) => n.id));
  const edges = EDGES.filter(([a, b]) => ids.has(a) && ids.has(b));

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full opacity-[0.55]"
    >
      {edges.map(([a, b], i) => {
        const na = NODES[a];
        const nb = NODES[b];
        return (
          <line
            key={i}
            x1={na.x}
            y1={na.y}
            x2={nb.x}
            y2={nb.y}
            stroke="rgb(var(--ea-a) / 0.3)"
            strokeWidth="0.25"
          />
        );
      })}
      {nodes.map((n) => (
        <circle
          key={n.id}
          cx={n.x}
          cy={n.y}
          r={n.r / 10}
          className="ea-pulse"
          style={{
            fill: `rgb(var(${n.accent ? "--ea-b" : "--ea-a"}))`,
            transformOrigin: `${n.x}px ${n.y}px`,
            transformBox: "fill-box",
            animationDelay: `${(n.id % 5) * 0.6}s`,
          }}
        />
      ))}
    </svg>
  );
}

export function AdminHeaderBackdrop({ density = "normal" }) {
  const cfg = densityConfig(density);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <style>{`
        :root {
          --ea-a: ${DEFAULT_LIGHT.a};
          --ea-b: ${DEFAULT_LIGHT.b};
        }
        @media (prefers-color-scheme: dark) {
          :root:not(.light) {
            --ea-a: ${DEFAULT_DARK.a};
            --ea-b: ${DEFAULT_DARK.b};
          }
        }
        :root.dark {
          --ea-a: ${DEFAULT_DARK.a};
          --ea-b: ${DEFAULT_DARK.b};
        }

        @keyframes ea-spin { from { transform: rotateX(var(--rx)) rotateY(var(--ry)); } to { transform: rotateX(calc(var(--rx) + 360deg)) rotateY(calc(var(--ry) + 360deg)); } }
        @keyframes ea-orbit { to { transform: rotate(360deg); } }
        @keyframes ea-orbit-rev { to { transform: rotate(-360deg); } }
        @keyframes ea-grid { from { transform: translateY(0); } to { transform: translateY(40px); } }
        @keyframes ea-drift { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(40px,18px,0); } }
        @keyframes ea-pulse { 0%,100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 1; transform: scale(1.6); } }
        @media (prefers-reduced-motion: no-preference) {
          .ea-spin { animation: ea-spin 28s linear infinite; }
          .ea-orbit { animation: ea-orbit 24s linear infinite; }
          .ea-orbit-rev { animation: ea-orbit-rev 34s linear infinite; }
          .ea-grid { animation: ea-grid 3s linear infinite; }
          .ea-drift { animation: ea-drift 18s ease-in-out infinite; }
          .ea-pulse { animation: ea-pulse 3.6s ease-in-out infinite; }
        }
      `}</style>

      {/* Base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg, rgb(var(--ea-a) / 0.10), transparent 50%, rgb(var(--ea-b) / 0.08))",
        }}
      />
      <div
        className="ea-drift absolute -left-16 -top-24 h-72 w-72 rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(closest-side, rgb(var(--ea-a) / 0.22), transparent)",
        }}
      />

      {/* Connected knowledge nodes */}
      <NodeNetwork count={cfg.nodeCount} />

      {/* Perspective grid floor */}
      {cfg.grid && (
        <div
          className="absolute inset-x-0 bottom-0 h-3/4 overflow-hidden text-[rgb(var(--ea-a))] [mask-image:linear-gradient(to_top,black_15%,transparent)] [-webkit-mask-image:linear-gradient(to_top,black_15%,transparent)]"
          style={{ perspective: 360 }}
        >
          <div
            className="absolute inset-x-[-60%] -top-[40%] h-[220%] opacity-[0.28]"
            style={{ transform: "rotateX(64deg)" }}
          >
            <div
              className="ea-grid absolute inset-x-0 -top-10 bottom-0 will-change-transform"
              style={{
                backgroundImage:
                  "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>
        </div>
      )}

      {/* Orbit ring + cube, right side (hidden on small screens) */}
      <div
        className="absolute -right-10 top-1/2 hidden -translate-y-1/2 sm:block"
        style={{ width: 280, height: 280, perspective: 800 }}
      >
        <div
          className="absolute inset-0"
          style={{ transform: "rotateX(72deg)" }}
        >
          <div className="ea-orbit relative size-full rounded-full border border-[rgb(var(--ea-b)/0.3)]">
            <span
              className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                backgroundColor: "rgb(var(--ea-b))",
                boxShadow: "0 0 14px 3px rgb(var(--ea-b) / 0.6)",
              }}
            />
          </div>

          {cfg.secondRing && (
            <div className="absolute inset-[18%] rounded-full border border-[rgb(var(--ea-a)/0.25)]">
              <div className="ea-orbit-rev relative size-full rounded-full">
                <span
                  className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    backgroundColor: "rgb(var(--ea-a))",
                    boxShadow: "0 0 10px 2px rgb(var(--ea-a) / 0.55)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <Cube size={56} className="absolute left-1/2 top-1/2 -ml-7 -mt-7" />
      </div>

      {/* Second, smaller cube on the left for depth (rich density only) */}
      {cfg.secondCube && (
        <Cube
          size={30}
          duration={36}
          from={[15, -40]}
          accent
          className="absolute left-10 bottom-10 hidden lg:block"
        />
      )}
    </div>
  );
}
