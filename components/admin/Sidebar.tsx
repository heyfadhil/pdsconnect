"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: number;
};

type NavGroup = {
  label?: string;
  items: NavItem[];
};

const Icon = ({ d, ...props }: { d: string } & React.SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d={d} />
  </svg>
);

const navGroups: NavGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
      },
    ],
  },
  {
    label: "Events",
    items: [
      {
        label: "All Events",
        href: "/admin/events",
        icon: <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
      },
    ],
  },
  {
    label: "Matches",
    items: [
      {
        label: "All Matches",
        href: "/admin/matches",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Users",
    items: [
      {
        label: "User Database",
        href: "/admin/users",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
      },
      {
        label: "Excel Upload",
        href: "/admin/users/upload",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <polyline points="9 15 12 12 15 15" />
          </svg>
        ),
        roles: ["admin", "superadmin"],
      },
    ],
  },
  {
    label: "Enquiries",
    items: [
      {
        label: "Enquiries",
        href: "/admin/enquiries",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        label: "Industries",
        href: "/admin/settings/industries",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        ),
      },
      {
        label: "System Settings",
        href: "/admin/settings",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        ),
        roles: ["superadmin"],
      },
      {
        label: "Manage Roles",
        href: "/admin/roles",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
        roles: ["superadmin"],
      },
    ],
  },
];

export default function Sidebar({ userRole, stalledCount = 0 }: { userRole: string; stalledCount?: number }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/admin/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-carbon-black flex flex-col z-30 select-none">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <Logo variant="dark" size="sm" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group, gi) => {
          const visible = group.items
            .filter((item) => !item.roles || item.roles.includes(userRole))
            .map((item) =>
              item.href === "/admin/matches" ? { ...item, badge: stalledCount } : item
            );
          if (!visible.length) return null;
          return (
            <div key={gi} className="mb-6">
              {group.label && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {group.label}
                </p>
              )}
              {visible.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 text-[13.5px] transition-all duration-fast mb-0.5 rounded-lg group"
                    style={
                      active
                        ? { background: "rgba(255,255,255,0.13)", boxShadow: "inset 3px 0 0 #5BABF0", color: "#FFFFFF", fontWeight: 600 }
                        : { color: "rgba(255,255,255,0.58)", fontWeight: 500 }
                    }
                  >
                    <span style={{ color: active ? "#5BABF0" : "rgba(255,255,255,0.42)" }}>
                      {item.icon}
                    </span>
                    {item.label}
                    {item.badge != null && item.badge > 0 && (
                      <span className="ml-auto text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#5BABF0" }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-fast hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
