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
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(16px) saturate(1.4)",
        WebkitBackdropFilter: "blur(16px) saturate(1.4)",
        borderBottom: "1px solid #D8E6F5",
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
          <p className="text-[11px] text-[#8A8A8A] leading-tight">{roleLabel[role] ?? role}</p>
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #2E7FD9 0%, #1A5FAA 100%)",
            border: "2px solid #5BABF0",
          }}
        >
          {initial}
        </div>
      </div>
    </header>
  );
}
