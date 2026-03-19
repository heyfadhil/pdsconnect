"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EventCard from "@/components/user/EventCard";
import { CalendarDays, MapPin, Calendar, Zap } from "lucide-react";

interface EventData {
  id: string;
  name: string;
  venue_name?: string | null;
  event_start_date?: string | null;
  event_end_date?: string | null;
  thumbnail_url?: string | null;
  isActive: boolean;
  role_in_event: "buyer" | "seller";
}

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Mobile Event Card ────────────────────────────────────────────────────────
function MobileEventCard({ event }: { event: EventData }) {
  const base = `/buyer/events/${event.id}`;
  const start = formatDate(event.event_start_date);
  const end = formatDate(event.event_end_date);
  const dateLabel = start && end && start !== end ? `${start} – ${end}` : start ?? "Date TBD";

  const GRADS = [
    "linear-gradient(135deg,#2E7FD9,#06B6D4)",
    "linear-gradient(135deg,#14B8A6,#06B6D4)",
    "linear-gradient(135deg,#1A5FAA,#2E7FD9)",
    "linear-gradient(135deg,#0D9488,#14B8A6)",
  ];
  const grad = GRADS[event.id.charCodeAt(0) % GRADS.length];

  return (
    <div
      className="flex-shrink-0 w-[260px] rounded-[22px] overflow-hidden flex flex-col snap-start"
      style={{
        background: "rgba(14,30,53,0.88)",
        border: "1px solid rgba(0,212,255,.12)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,.35)",
      }}
    >
      {/* Thumbnail / gradient hero */}
      <div className="h-[120px] relative overflow-hidden flex-shrink-0">
        {event.thumbnail_url ? (
          <img src={event.thumbnail_url} alt={event.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: grad }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,.1) 0%,rgba(14,30,53,.7) 100%)" }} />
        {/* Status badge */}
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide"
          style={event.isActive
            ? { background: "rgba(5,150,105,.20)", color: "#34D399", border: "1px solid rgba(52,211,153,.25)" }
            : { background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.45)", border: "1px solid rgba(255,255,255,.12)" }
          }
        >
          {event.isActive ? "Active" : "Archived"}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-3.5 flex-1">
        <p className="text-white font-black text-[15px] leading-tight" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>
          {event.name}
        </p>
        <div className="flex flex-col gap-1">
          {dateLabel && (
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(255,255,255,.45)" }}>
              <Calendar size={11} />
              {dateLabel}
            </div>
          )}
          {event.venue_name && (
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(255,255,255,.45)" }}>
              <MapPin size={11} />
              <span className="truncate">{event.venue_name}</span>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex gap-1.5 mt-auto pt-1.5">
          <Link
            href={`${base}/match`}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-white text-[11px] font-black active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg,#2E7FD9,#06B6D4)", boxShadow: "0 3px 12px rgba(6,182,212,.35)" }}
          >
            <Zap size={11} />
            Match
          </Link>
          <Link
            href={`${base}/matches`}
            className="flex-1 py-2 rounded-xl text-center text-[11px] font-semibold active:scale-95 transition-transform"
            style={{ background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.6)", border: "1px solid rgba(255,255,255,.10)" }}
          >
            Matches
          </Link>
          <Link
            href={`${base}/schedule`}
            className="flex-1 py-2 rounded-xl text-center text-[11px] font-semibold active:scale-95 transition-transform"
            style={{ background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.6)", border: "1px solid rgba(255,255,255,.10)" }}
          >
            Schedule
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BuyerDashboard() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/events")
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .finally(() => setLoading(false));
  }, []);

  const active = events.filter((e) => e.isActive);
  const archived = events.filter((e) => !e.isActive);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(216,230,245,0.5)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">

      {/* ── MOBILE: dark aurora hero ── */}
      <div
        className="md:hidden -mx-6 -mt-8 px-6 pt-12 pb-6 relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at 20% 50%,rgba(6,182,212,.20) 0%,transparent 60%), radial-gradient(ellipse at 80% 30%,rgba(46,127,217,.18) 0%,transparent 60%), #06101E",
        }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[.10em] mb-1" style={{ color: "rgba(0,212,255,.65)" }}>Welcome back</p>
        <h1 className="text-[26px] font-black text-white leading-tight mb-1" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>Your Events</h1>
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,.50)" }}>
          {events.length === 0
            ? "No events assigned yet."
            : `${events.length} event${events.length !== 1 ? "s" : ""} registered`}
        </p>
        {/* Decorative glow */}
        <div className="absolute right-0 top-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(circle,rgba(0,212,255,.12) 0%,transparent 70%)" }} />
      </div>

      {/* ── DESKTOP: light header card ── */}
      <div className="hidden md:block rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #1A5FAA 100%)", boxShadow: "0 4px 20px rgba(46,127,217,0.25)" }}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.10em] mb-1" style={{ color: "rgba(255,255,255,0.65)" }}>Welcome back</p>
        <h1 className="font-display text-[24px] font-bold text-white leading-tight">Your Events</h1>
        <p className="text-[14px] mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>
          {events.length === 0 ? "No events assigned yet." : `You are registered in ${events.length} event${events.length !== 1 ? "s" : ""}.`}
        </p>
      </div>

      {events.length === 0 ? (
        <>
          {/* Mobile empty state */}
          <div className="md:hidden flex flex-col items-center gap-4 text-center py-12">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <CalendarDays size={28} strokeWidth={1.5} style={{ color: "rgba(255,255,255,.35)" }} />
            </div>
            <div>
              <p className="text-[16px] font-semibold text-white mb-1">No events yet</p>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,.45)" }}>You haven&apos;t been assigned to any events.</p>
            </div>
          </div>
          {/* Desktop empty state */}
          <div className="hidden md:flex rounded-2xl p-12 flex-col items-center gap-4 text-center"
            style={{ background: "#FFFFFF", border: "1px solid #D8E6F5", boxShadow: "0 2px 12px rgba(46,127,217,0.06)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EEF5FC" }}>
              <CalendarDays size={28} strokeWidth={1.5} color="#2E7FD9" />
            </div>
            <div>
              <p className="text-[16px] font-semibold text-[#0D0D0D] mb-1">No events yet</p>
              <p className="text-[14px] text-[#8A8A8A]">You haven&apos;t been assigned to any events. Check back once the admin has added you.</p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ── MOBILE: horizontal scroll event strips ── */}
          <div className="md:hidden flex flex-col gap-5">
            {active.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-0">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#34D399", boxShadow: "0 0 6px #34D399" }} />
                  <span className="text-[12px] font-bold uppercase tracking-[.08em]" style={{ color: "rgba(255,255,255,.55)" }}>Active Events</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full ml-1" style={{ background: "rgba(52,211,153,.12)", color: "#34D399", border: "1px solid rgba(52,211,153,.20)" }}>{active.length}</span>
                </div>
                <div
                  className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 snap-x snap-mandatory"
                  style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
                >
                  {active.map((e) => (
                    <MobileEventCard key={e.id} event={e} />
                  ))}
                </div>
              </div>
            )}

            {archived.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,.30)" }} />
                  <span className="text-[12px] font-bold uppercase tracking-[.08em]" style={{ color: "rgba(255,255,255,.40)" }}>Archived Events</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full ml-1" style={{ background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.35)", border: "1px solid rgba(255,255,255,.10)" }}>{archived.length}</span>
                </div>
                <div
                  className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 snap-x snap-mandatory"
                  style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
                >
                  {archived.map((e) => (
                    <MobileEventCard key={e.id} event={e} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── DESKTOP: grid layout ── */}
          <div className="hidden md:flex flex-col gap-8">
            {active.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                  <h2 className="font-display font-semibold text-[18px] text-[#0D0D0D]">Active Events</h2>
                  <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full ml-1" style={{ background: "#ECFDF5", color: "#059669" }}>{active.length}</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {active.map((e) => (
                    <EventCard key={e.id} event={{ ...e, role_in_event: "buyer" }} />
                  ))}
                </div>
              </section>
            )}

            {archived.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A8A8A]" />
                  <h2 className="font-display font-semibold text-[18px] text-[#3A3A3A]">Archived Events</h2>
                  <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full ml-1" style={{ background: "#F3F4F6", color: "#6B7280" }}>{archived.length}</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {archived.map((e) => (
                    <EventCard key={e.id} event={{ ...e, role_in_event: "buyer" }} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
}
