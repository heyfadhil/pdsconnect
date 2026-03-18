"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, LogOut, ChevronDown } from "lucide-react";

interface Props {
  userName: string;
  userRole: "buyer" | "procurer";
}

export default function UserNav({ userName, userRole }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  const dashboardHref = `/${userRole}/dashboard`;

  useEffect(() => {
    fetch("/api/user/notifications")
      .then((r) => r.json())
      .then((d) => setNotifCount(d.count ?? 0))
      .catch(() => {});
  }, [pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Detect if we're inside an event page and extract event id
  const eventMatch = pathname.match(/\/(?:buyer|procurer)\/events\/([^/]+)/);
  const eventId = eventMatch?.[1];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-light-border shadow-xs">
      <div className="max-w-content mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-6">
          <Link href={dashboardHref} className="font-display font-bold text-calm-blue text-lg tracking-tight">
            PDS Connect
          </Link>

          {/* Event sub-nav */}
          {eventId && (
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                href={`/${userRole}/events/${eventId}/discover`}
                label="Discover"
                active={pathname.includes("/discover")}
              />
              {userRole === "procurer" && (
                <NavLink
                  href={`/${userRole}/events/${eventId}/inbox`}
                  label="Inbox"
                  active={pathname.includes("/inbox")}
                />
              )}
              <div className="relative">
                <NavLink
                  href={`/${userRole}/events/${eventId}/matches`}
                  label="Matches"
                  active={pathname.includes("/matches")}
                />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </div>
              <NavLink
                href={`/${userRole}/events/${eventId}/schedule`}
                label="My Schedule"
                active={pathname.includes("/schedule")}
              />
            </nav>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link
            href={dashboardHref}
            className={`hidden md:block text-body-sm font-medium transition-colors ${
              pathname === dashboardHref ? "text-calm-blue" : "text-ink-gray hover:text-calm-blue"
            }`}
          >
            Dashboard
          </Link>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-light-border bg-off-white hover:bg-pale-blue-tint transition-colors text-body-sm font-medium text-ink-gray"
            >
              <User size={14} className="text-calm-blue" />
              <span className="hidden sm:block max-w-[120px] truncate">{userName}</span>
              <ChevronDown size={12} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-light-border rounded-xl shadow-md py-1 z-50">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-body-sm text-ink-gray hover:bg-pale-blue-tint"
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={13} />
                  Edit Profile
                </Link>
                <div className="border-t border-light-border my-1" />
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-body-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={13} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-body-sm font-medium transition-colors ${
        active
          ? "bg-pale-blue-tint text-calm-blue"
          : "text-ink-gray hover:text-calm-blue hover:bg-pale-blue-tint"
      }`}
    >
      {label}
    </Link>
  );
}
