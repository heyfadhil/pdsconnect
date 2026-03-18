interface LogoProps {
  variant?: "light" | "dark" | "blue";
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { icon: 0.7, pds: 20, connect: 20, tagline: 9 },
  md: { icon: 1, pds: 28, connect: 28, tagline: 10.5 },
  lg: { icon: 1.3, pds: 36, connect: 36, tagline: 12 },
};

const colors = {
  light: {
    nodesFill: "#2E7FD9",
    arc: "#5BABF0",
    apexDot: "#5BABF0",
    pds: "#2E7FD9",
    connect: "#0D0D0D",
    tagline: "#8A8A8A",
  },
  dark: {
    nodesFill: "#5BABF0",
    arc: "#5BABF0",
    apexDot: "#FFFFFF",
    pds: "#5BABF0",
    connect: "#FFFFFF",
    tagline: "#8A8A8A",
  },
  blue: {
    nodesFill: "#FFFFFF",
    arc: "rgba(255,255,255,0.7)",
    apexDot: "rgba(255,255,255,0.85)",
    pds: "#FFFFFF",
    connect: "rgba(255,255,255,0.88)",
    tagline: "rgba(255,255,255,0.55)",
  },
};

export default function Logo({
  variant = "light",
  showTagline = false,
  size = "md",
  className = "",
}: LogoProps) {
  const c = colors[variant];
  const s = sizes[size];

  // Icon dimensions
  const iconW = Math.round(52 * s.icon);
  const iconH = Math.round(32 * s.icon);
  const r = Math.round(5.5 * s.icon);
  const dotR = Math.round(3.2 * s.icon);
  const lx = Math.round(10 * s.icon);
  const rx = Math.round(42 * s.icon);
  const ny = Math.round(20 * s.icon);
  const apex = Math.round(9 * s.icon);
  const mx = Math.round(26 * s.icon);

  const totalH = showTagline ? s.pds + 22 : s.pds + 4;
  const textY = totalH - (showTagline ? 16 : 2);
  const taglineY = textY + 18;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Connection icon */}
      <svg
        width={iconW}
        height={iconH}
        viewBox={`0 0 ${iconW} ${iconH}`}
        fill="none"
        aria-hidden="true"
      >
        <path
          d={`M ${lx} ${ny} Q ${mx} ${apex} ${rx} ${ny}`}
          stroke={c.arc}
          strokeWidth={Math.round(2.2 * s.icon)}
          fill="none"
          strokeLinecap="round"
        />
        <circle cx={lx} cy={ny} r={r} fill={c.nodesFill} />
        <circle cx={rx} cy={ny} r={r} fill={c.nodesFill} />
        <circle cx={mx} cy={apex} r={dotR} fill={c.apexDot} />
      </svg>

      {/* Wordmark + optional tagline */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-[2px]">
          <span
            style={{
              fontSize: s.pds,
              fontWeight: 800,
              color: c.pds,
              letterSpacing: "-0.5px",
              lineHeight: 1,
              fontFamily: "var(--font-inter), Inter, sans-serif",
            }}
          >
            PDS
          </span>
          <span
            style={{
              fontSize: s.connect,
              fontWeight: 400,
              color: c.connect,
              letterSpacing: "-0.3px",
              lineHeight: 1,
              fontFamily: "var(--font-inter), Inter, sans-serif",
            }}
          >
            Connect
          </span>
        </div>
        {showTagline && (
          <span
            style={{
              fontSize: s.tagline,
              fontWeight: 600,
              color: c.tagline,
              letterSpacing: "1.8px",
              lineHeight: 1,
              marginTop: 5,
              fontFamily: "var(--font-inter), Inter, sans-serif",
            }}
          >
            BUSINESS MATCHING PLATFORM
          </span>
        )}
      </div>
    </div>
  );
}
