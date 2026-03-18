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
      className={`rounded-2xl p-6 border ${
        accent
          ? "bg-calm-blue border-calm-blue text-white"
          : "bg-white border-light-border shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <p
          className={`text-label uppercase tracking-[0.08em] font-semibold ${
            accent ? "text-white/70" : "text-mid-gray"
          }`}
        >
          {label}
        </p>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            accent ? "bg-white/15" : "bg-pale-blue-tint"
          }`}
        >
          <span className={accent ? "text-white" : "text-calm-blue"}>
            {icon}
          </span>
        </div>
      </div>
      <p
        className={`font-display text-[36px] font-bold leading-none ${
          accent ? "text-white" : "text-carbon-black"
        }`}
      >
        {value}
      </p>
      {trend && (
        <p
          className={`text-body-sm mt-2 ${
            accent ? "text-white/70" : "text-mid-gray"
          }`}
        >
          {trend}
        </p>
      )}
    </div>
  );
}
