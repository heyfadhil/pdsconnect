"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, icon, trend, accent }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 transition-all duration-[250ms] cursor-default"
      style={
        accent
          ? {
              background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 50%, #14B8A6 100%)",
              boxShadow: "0 8px 32px rgba(6,182,212,0.30)",
              borderRadius: "20px",
            }
          : {
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(20px) saturate(1.3)",
              border: "1px solid rgba(6,182,212,0.15)",
              boxShadow: "0 2px 16px rgba(6,182,212,0.07), inset 0 1px 0 rgba(255,255,255,0.60)",
              borderRadius: "20px",
              transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
            }
      }
      onMouseEnter={(e) => {
        if (!accent) {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "translateY(-3px)";
          el.style.borderColor = "rgba(6,182,212,0.40)";
          el.style.boxShadow = "0 8px 32px rgba(6,182,212,0.15), inset 0 1px 0 rgba(255,255,255,0.80)";
        }
      }}
      onMouseLeave={(e) => {
        if (!accent) {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "";
          el.style.borderColor = "";
          el.style.boxShadow = "";
        }
      }}
    >
      {/* Icon container — gradient bg */}
      <div
        className="w-10 h-10 flex items-center justify-center flex-shrink-0 transition-all duration-[250ms]"
        style={{
          borderRadius: "10px",
          background: accent
            ? "rgba(255,255,255,0.22)"
            : "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)",
        }}
        onMouseEnter={(e) => {
          if (!accent) {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(6,182,212,0.40)";
          }
        }}
        onMouseLeave={(e) => {
          if (!accent) {
            (e.currentTarget as HTMLElement).style.boxShadow = "";
          }
        }}
      >
        <span className="text-white">{icon}</span>
      </div>

      {/* Value + label */}
      <div>
        <p
          className="font-display font-bold leading-none"
          style={{
            fontSize: "34px",
            color: accent ? "#FFFFFF" : "#0D0D0D",
            letterSpacing: "-0.02em",
          }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p
          className="text-[13px] font-medium mt-1.5"
          style={{ color: accent ? "rgba(255,255,255,0.72)" : "#8A8A8A" }}
        >
          {label}
        </p>
        {trend && (
          <p className="text-[12px] mt-1" style={{ color: accent ? "rgba(255,255,255,0.60)" : "#8A8A8A" }}>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
