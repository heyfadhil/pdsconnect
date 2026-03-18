"use client";

import { usePathname } from "next/navigation";

const routeLabels: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/events/new": "New Event",
  "/admin/events": "Events",
  "/admin/matches": "Matches",
  "/admin/users/upload": "Excel Upload",
  "/admin/users": "Users",
  "/admin/enquiries": "Enquiries",
  "/admin/settings/industries": "Industries",
  "/admin/settings": "System Settings",
};

export default function Topbar({ name, role }: { name: string; role: string }) {
  const pathname = usePathname();

  const label =
    Object.entries(routeLabels)
      .filter(([path]) => pathname === path || pathname.startsWith(path + "/"))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? "Admin";

  const initial = name?.[0]?.toUpperCase() ?? "A";

  const roleLabel: Record<string, string> = {
    superadmin: "Super Admin",
    admin: "Admin",
    staff: "Staff",
  };

  return (
    <header
      className="sticky top-0 z-20 h-16 flex items-center justify-between px-8"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px) saturate(1.6)",
        WebkitBackdropFilter: "blur(20px) saturate(1.6)",
        borderBottom: "1px solid rgba(6,182,212,0.12)",
      }}
    >
      {/* Left — page label */}
      <p className="font-display font-semibold text-[17px] text-[#0D0D0D] tracking-[-0.01em]">
        {label}
      </p>

      {/* Right — user */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-[13px] font-semibold text-[#0D0D0D] leading-tight">{name}</p>
          <p className="text-[11px] leading-tight" style={{ color: "#8A8A8A" }}>{roleLabel[role] ?? role}</p>
        </div>
        {/* Avatar with gradient border */}
        <div className="p-[2px] rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #2E7FD9, #06B6D4)" }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold"
            style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)" }}
          >
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
