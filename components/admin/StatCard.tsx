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
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={
        accent
          ? {
              background: "linear-gradient(135deg, #2E7FD9 0%, #1A5FAA 100%)",
              boxShadow: "0 4px 20px rgba(46,127,217,0.28)",
            }
          : {
              background: "#FFFFFF",
              border: "1px solid #D8E6F5",
              boxShadow: "0 2px 12px rgba(46,127,217,0.06)",
            }
      }
    >
      {/* Icon container */}
      <div
        className="w-10 h-10 flex items-center justify-center flex-shrink-0"
        style={{
          borderRadius: "10px",
          background: accent ? "rgba(255,255,255,0.20)" : "#EEF5FC",
        }}
      >
        <span className={accent ? "text-white/85" : "text-[#2E7FD9]"}>{icon}</span>
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
