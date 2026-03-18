"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useRef, useState } from "react";
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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        ),
      },
      {
        label: "System Settings",
        href: "/admin/settings",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
  const [expanded, setExpanded] = useState(false);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    setExpanded(true);
  };

  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => setExpanded(false), 100);
  };

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
    <aside
      className="fixed top-0 left-0 h-screen z-30 select-none flex flex-col overflow-hidden"
      style={{
        width: expanded ? "240px" : "72px",
        transition: "width 220ms ease-in-out",
        background: "#FFFFFF",
        borderRight: "1px solid rgba(6,182,212,0.12)",
        boxShadow: expanded ? "2px 0 20px rgba(6,182,212,0.08)" : "none",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo zone */}
      <div
        className="h-16 flex items-center px-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(6,182,212,0.10)" }}
      >
        <div
          className="overflow-hidden whitespace-nowrap"
          style={{
            opacity: expanded ? 1 : 0,
            transition: expanded ? "opacity 120ms 60ms" : "opacity 80ms",
          }}
        >
          <Logo variant="light" size="sm" />
        </div>
        {!expanded && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #2E7FD9, #06B6D4)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="7" cy="12" r="3" fill="white" />
              <circle cx="17" cy="12" r="3" fill="white" />
              <path d="M10 12h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2">
        {navGroups.map((group, gi) => {
          const visible = group.items
            .filter((item) => !item.roles || item.roles.includes(userRole))
            .map((item) =>
              item.href === "/admin/matches" ? { ...item, badge: stalledCount } : item
            );
          if (!visible.length) return null;
          return (
            <div key={gi} className="mb-5">
              {group.label && (
                <div
                  className="overflow-hidden whitespace-nowrap px-3 mb-1.5"
                  style={{
                    opacity: expanded ? 1 : 0,
                    transition: expanded ? "opacity 100ms 40ms" : "opacity 60ms",
                    maxHeight: expanded ? "20px" : "0px",
                  }}
                >
                  <p
                    className="text-[11px] font-semibold uppercase"
                    style={{ color: "#8A8A8A", letterSpacing: "1.2px" }}
                  >
                    {group.label}
                  </p>
                </div>
              )}
              {visible.map((item) => {
                const active = isActive(item.href);
                return (
                  <div key={item.href} className="relative group/item">
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 h-11 px-3 rounded-lg mb-0.5 transition-all duration-[120ms] overflow-hidden whitespace-nowrap"
                      style={
                        active
                          ? {
                              background: "#ECFEFF",
                              borderLeft: "3px solid",
                              borderImage: "linear-gradient(180deg, #2E7FD9, #06B6D4) 1",
                              paddingLeft: "9px",
                            }
                          : {}
                      }
                      onMouseEnter={(e) => {
                        if (!active) {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "#ECFEFF";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "";
                        }
                      }}
                    >
                      {/* Icon */}
                      <span
                        className="flex-shrink-0 transition-colors duration-[120ms]"
                        style={{
                          color: active ? "#06B6D4" : "#8A8A8A",
                        }}
                      >
                        {item.icon}
                      </span>

                      {/* Label */}
                      <span
                        className="text-[14px] font-medium flex-1 overflow-hidden"
                        style={{
                          color: active ? "#0D0D0D" : "#3A3A3A",
                          fontWeight: active ? 600 : 500,
                          opacity: expanded ? 1 : 0,
                          transition: expanded ? "opacity 120ms 60ms" : "opacity 80ms",
                          maxWidth: expanded ? "160px" : "0px",
                        }}
                      >
                        {item.label}
                      </span>

                      {/* Badge */}
                      {item.badge != null && item.badge > 0 && expanded && (
                        <span
                          className="ml-auto text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #2E7FD9, #06B6D4)" }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>

                    {/* Tooltip when collapsed */}
                    {!expanded && (
                      <div
                        className="absolute left-[68px] top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-white whitespace-nowrap pointer-events-none z-50 opacity-0 group-hover/item:opacity-100 transition-opacity duration-[150ms] delay-[350ms]"
                        style={{ background: "#0D0D0D", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                      >
                        {item.label}
                        {item.badge != null && item.badge > 0 && (
                          <span className="ml-2 bg-vivid-cyan text-white text-[10px] font-bold px-1 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Sign out */}
      <div
        className="px-2 py-4 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(6,182,212,0.10)" }}
      >
        <div className="relative group/signout">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full h-11 px-3 rounded-lg text-[14px] font-medium transition-all duration-[120ms] overflow-hidden whitespace-nowrap"
            style={{ color: "#8A8A8A" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "#ECFEFF";
              el.style.color = "#0D0D0D";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "";
              el.style.color = "#8A8A8A";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span
              style={{
                opacity: expanded ? 1 : 0,
                transition: expanded ? "opacity 120ms 60ms" : "opacity 80ms",
                maxWidth: expanded ? "160px" : "0px",
              }}
            >
              Sign Out
            </span>
          </button>

          {/* Tooltip */}
          {!expanded && (
            <div
              className="absolute left-[68px] top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-white whitespace-nowrap pointer-events-none z-50 opacity-0 group-hover/signout:opacity-100 transition-opacity duration-[150ms] delay-[350ms]"
              style={{ background: "#0D0D0D" }}
            >
              Sign Out
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
