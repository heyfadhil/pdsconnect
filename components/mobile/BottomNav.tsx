"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Zap, Handshake, User } from "lucide-react";

interface Props {
  role: "buyer" | "seller";
  notifCount?: number;
}

export default function BottomNav({ role, notifCount = 0 }: Props) {
  const pathname = usePathname();

  // Extract eventId from current URL if we're in an event context
  const parts = pathname.split("/");
  const eventsIdx = parts.indexOf("events");
  const activeEventId = eventsIdx !== -1 ? parts[eventsIdx + 1] : null;

  const dash = `/${role}/dashboard`;
  const matchHref = activeEventId
    ? `/${role}/events/${activeEventId}/match`
    : dash;
  const matchesHref = activeEventId
    ? `/${role}/events/${activeEventId}/matches`
    : dash;

  const tabs = [
    { key: "home", label: "Home", Icon: Home, href: dash },
    { key: "match", label: "Match", Icon: Zap, href: matchHref },
    { key: "matches", label: "Matches", Icon: Handshake, href: matchesHref },
    { key: "profile", label: "Profile", Icon: User, href: "/profile" },
  ];

  function isActive(key: string) {
    if (key === "home") return pathname.endsWith("/dashboard");
    if (key === "match") return pathname.endsWith("/match");
    if (key === "matches") return pathname.endsWith("/matches");
    if (key === "profile") return pathname.startsWith("/profile");
    return false;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[200] flex items-center justify-around"
      style={{
        height: "72px",
        background: "rgba(10,15,30,0.94)",
        backdropFilter: "blur(20px) saturate(1.4)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {tabs.map(({ key, label, Icon, href }) => {
        const active = isActive(key);
        const showBadge = key === "matches" && notifCount > 0;

        return (
          <Link
            key={key}
            href={href}
            className="relative flex flex-col items-center gap-[3px] px-5 py-2 transition-transform active:scale-90"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {/* Icon */}
            {active ? (
              <span
                className="inline-flex"
                style={{
                  background:
                    "linear-gradient(135deg, #2E7FD9, #06B6D4, #14B8A6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                <Icon size={22} strokeWidth={2} />
              </span>
            ) : (
              <Icon size={22} strokeWidth={1.8} color="rgba(255,255,255,0.35)" />
            )}

            {/* Label */}
            <span
              className="text-[10px] font-bold leading-none"
              style={
                active
                  ? {
                      background:
                        "linear-gradient(135deg, #2E7FD9, #06B6D4, #14B8A6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }
                  : { color: "rgba(255,255,255,0.35)" }
              }
            >
              {label}
            </span>

            {/* Notification badge */}
            {showBadge && (
              <span
                className="absolute top-[6px] right-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center text-[10px] font-black"
                style={{
                  background: "#00D4FF",
                  color: "#030810",
                  boxShadow: "0 0 8px rgba(0,212,255,0.65)",
                  padding: "0 4px",
                }}
              >
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
