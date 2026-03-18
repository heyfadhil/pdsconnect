"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { X, Calendar, Users, Search } from "lucide-react";

interface CalendarMatch {
  id: string;
  status: string;
  cancel_reason?: string | null;
  buyer: { id: string; name: string; company_name: string };
  seller: { id: string; name: string; company_name: string };
  booked_slot: { id: string; start_time: string; end_time: string } | null;
}

interface Popup {
  match: CalendarMatch;
  dayLabel: string;
  timeLabel: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  scheduled:       { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" },
  pending:         { bg: "#EEF5FC", text: "#2E7FD9", border: "#BFDBFE" },
  awaiting_buyer:  { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  negotiating:     { bg: "#EFF6FF", text: "#1A5FAA", border: "#BFDBFE" },
  completed:       { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" },
  cancelled:       { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
};

function fmt(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleString("en-MY", opts);
}

export default function AdminCalendarPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [matches, setMatches] = useState<CalendarMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [popup, setPopup] = useState<Popup | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/events/${eventId}/matches`).then((r) => r.json()),
      fetch(`/api/admin/events/${eventId}`).then((r) => r.json()),
    ]).then(([matchData, evtData]) => {
      setMatches(matchData.matches ?? []);
      setEventName(evtData.event?.name ?? "");
    }).finally(() => setLoading(false));
  }, [eventId]);

  async function cancelMatch(matchId: string) {
    const reason = prompt("Reason for cancellation (optional):");
    if (reason === null) return; // dismissed
    setCancelling(true);
    await fetch(`/api/admin/matches/${matchId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, status: "cancelled", cancel_reason: reason || null } : m
      )
    );
    setPopup(null);
    setCancelling(false);
  }

  // Filter matches by buyer/seller name or company
  const filterLower = filter.toLowerCase();
  const filteredMatches = matches.filter((m) => {
    if (!filterLower) return true;
    return (
      m.buyer.name.toLowerCase().includes(filterLower) ||
      m.buyer.company_name.toLowerCase().includes(filterLower) ||
      m.seller.name.toLowerCase().includes(filterLower) ||
      m.seller.company_name.toLowerCase().includes(filterLower)
    );
  });

  // Build calendar grid: only matches with a booked_slot
  const scheduledMatches = filteredMatches.filter((m) => m.booked_slot);

  // Collect unique days and times
  const dayMap = new Map<string, Date>(); // "YYYY-MM-DD" → Date
  const timeMap = new Map<string, string>(); // "HH:MM" → formatted label

  for (const m of scheduledMatches) {
    const slot = m.booked_slot!;
    const d = new Date(slot.start_time);
    const dayKey = d.toISOString().split("T")[0];
    if (!dayMap.has(dayKey)) dayMap.set(dayKey, d);

    const timeKey = fmt(slot.start_time, { hour: "2-digit", minute: "2-digit", hour12: false });
    const endKey = fmt(slot.end_time, { hour: "2-digit", minute: "2-digit", hour12: false });
    const timeLabel = `${timeKey} – ${endKey}`;
    if (!timeMap.has(timeKey)) timeMap.set(timeKey, timeLabel);
  }

  const days = Array.from(dayMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  const times = Array.from(timeMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  // Index: dayKey + "|" + timeKey → matches[]
  const cellIndex = new Map<string, CalendarMatch[]>();
  for (const m of scheduledMatches) {
    const slot = m.booked_slot!;
    const d = new Date(slot.start_time);
    const dayKey = d.toISOString().split("T")[0];
    const timeKey = fmt(slot.start_time, { hour: "2-digit", minute: "2-digit", hour12: false });
    const key = `${dayKey}|${timeKey}`;
    const existing = cellIndex.get(key) ?? [];
    existing.push(m);
    cellIndex.set(key, existing);
  }

  // Unscheduled but active matches
  const unscheduled = filteredMatches.filter(
    (m) => !m.booked_slot && !["cancelled", "completed"].includes(m.status)
  );

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "rgba(216,230,245,0.5)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href={`/admin/events/${eventId}`} className="text-[12px] text-[#8A8A8A] hover:text-[#06B6D4] transition-colors mb-1 block">← Back to Event</Link>
          <h1 className="font-display font-bold text-[24px] text-[#0D0D0D]">Calendar View</h1>
          {eventName && <p className="text-[14px] text-[#8A8A8A] mt-0.5">{eventName}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
            <input
              type="text"
              placeholder="Filter by name or company…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border text-[13px] bg-white focus:outline-none focus:border-[#06B6D4] focus:shadow-[0_0_0_3px_rgba(6,182,212,0.12)] transition-all"
              style={{ borderColor: "rgba(6,182,212,0.2)", minWidth: "240px" }}
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: "Total Matches", value: filteredMatches.length },
          { label: "Scheduled", value: scheduledMatches.length },
          { label: "Unscheduled", value: unscheduled.length },
          { label: "Cancelled", value: filteredMatches.filter((m) => m.status === "cancelled").length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl px-5 py-3 flex flex-col gap-0.5"
            style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(6,182,212,0.12)", boxShadow: "0 2px 8px rgba(6,182,212,0.06)" }}>
            <span className="font-display font-bold text-[22px] text-[#0D0D0D]">{s.value}</span>
            <span className="text-[12px] text-[#8A8A8A]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {days.length === 0 ? (
        <div className="rounded-2xl p-12 flex flex-col items-center gap-3 text-center"
          style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(6,182,212,0.12)" }}>
          <Calendar size={32} strokeWidth={1.2} className="text-[#8A8A8A]" />
          <p className="text-[14px] text-[#8A8A8A]">No scheduled meetings yet. Once matches are confirmed, they will appear here.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(6,182,212,0.15)", boxShadow: "0 4px 20px rgba(6,182,212,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(6,182,212,0.15)" }}>
                  {/* Time column header */}
                  <th className="px-4 py-3 text-left w-36 flex-shrink-0"
                    style={{ background: "#F8FAFE" }}>
                    <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider">Time</span>
                  </th>
                  {days.map(([dayKey, dayDate]) => (
                    <th key={dayKey} className="px-4 py-3 text-left min-w-[180px]"
                      style={{ background: "#F8FAFE", borderLeft: "1px solid rgba(6,182,212,0.10)" }}>
                      <div className="text-[13px] font-semibold text-[#0D0D0D]">
                        {dayDate.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {times.map(([timeKey, timeLabel], rowIdx) => (
                  <tr key={timeKey} style={{ borderBottom: "1px solid rgba(6,182,212,0.08)" }}>
                    <td className="px-4 py-3 align-top"
                      style={{ background: rowIdx % 2 === 0 ? "#FAFCFE" : "#FFFFFF", borderRight: "1px solid rgba(6,182,212,0.10)" }}>
                      <span className="text-[12px] font-semibold text-[#8A8A8A] whitespace-nowrap">{timeLabel}</span>
                    </td>
                    {days.map(([dayKey]) => {
                      const cellMatches = cellIndex.get(`${dayKey}|${timeKey}`) ?? [];
                      return (
                        <td key={dayKey} className="px-2 py-2 align-top"
                          style={{ background: rowIdx % 2 === 0 ? "#FAFCFE" : "#FFFFFF", borderLeft: "1px solid rgba(6,182,212,0.08)", minWidth: "180px" }}>
                          <div className="flex flex-col gap-1">
                            {cellMatches.map((m) => {
                              const s = STATUS_COLORS[m.status] ?? STATUS_COLORS.pending;
                              return (
                                <button
                                  key={m.id}
                                  onClick={() => setPopup({ match: m, dayLabel: new Date(m.booked_slot!.start_time).toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" }), timeLabel })}
                                  className="w-full text-left rounded-lg px-2.5 py-2 transition-all hover:-translate-y-0.5 hover:shadow-md"
                                  style={{ background: s.bg, border: `1px solid ${s.border}` }}
                                >
                                  <p className="text-[11px] font-semibold text-[#0D0D0D] truncate">{m.buyer.company_name}</p>
                                  <p className="text-[10px] text-[#8A8A8A] truncate">↔ {m.seller.company_name}</p>
                                  <span className="inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize"
                                    style={{ color: s.text, background: "rgba(255,255,255,0.6)" }}>
                                    {m.status}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unscheduled matches panel */}
      {unscheduled.length > 0 && (
        <div className="rounded-2xl p-6"
          style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(6,182,212,0.12)", boxShadow: "0 2px 12px rgba(6,182,212,0.06)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-[#06B6D4]" />
            <h2 className="font-display font-semibold text-[15px] text-[#0D0D0D]">
              Unscheduled Matches <span className="text-[#8A8A8A] font-normal text-[13px]">({unscheduled.length})</span>
            </h2>
          </div>
          <div className="space-y-2">
            {unscheduled.map((m) => {
              const s = STATUS_COLORS[m.status] ?? STATUS_COLORS.pending;
              return (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "#F8FAFE", border: "1px solid rgba(6,182,212,0.10)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#0D0D0D]">{m.buyer.company_name} <span className="font-normal text-[#8A8A8A]">↔</span> {m.seller.company_name}</p>
                    <p className="text-[11px] text-[#8A8A8A] mt-0.5">{m.buyer.name} · {m.seller.name}</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize"
                    style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                    {m.status.replace(/_/g, " ")}
                  </span>
                  <button
                    onClick={() => cancelMatch(m.id)}
                    className="text-[12px] font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Match popup */}
      {popup && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setPopup(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md rounded-2xl p-6 space-y-5"
              style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(6,182,212,0.18)", boxShadow: "0 24px 60px rgba(6,182,212,0.15)" }}>

              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8A8A] mb-0.5">Match Details</p>
                  <h3 className="font-display font-bold text-[17px] text-[#0D0D0D] leading-tight">
                    {popup.match.buyer.company_name} <span className="text-[#8A8A8A] font-normal">↔</span> {popup.match.seller.company_name}
                  </h3>
                </div>
                <button onClick={() => setPopup(null)} className="p-1.5 rounded-lg text-[#8A8A8A] hover:bg-[#ECFEFF] hover:text-[#06B6D4] transition-colors flex-shrink-0">
                  <X size={16} />
                </button>
              </div>

              {/* Time */}
              <div className="rounded-xl p-3" style={{ background: "#F8FAFE", border: "1px solid rgba(6,182,212,0.12)" }}>
                <p className="text-[12px] font-semibold text-[#8A8A8A] mb-0.5">Meeting Time</p>
                <p className="text-[14px] font-semibold text-[#0D0D0D]">{popup.dayLabel}</p>
                <p className="text-[13px] text-[#4B5563]">{popup.timeLabel}</p>
              </div>

              {/* Participants */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: "#F8FAFE", border: "1px solid rgba(6,182,212,0.12)" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#06B6D4] mb-1">Buyer</p>
                  <p className="text-[13px] font-semibold text-[#0D0D0D]">{popup.match.buyer.company_name}</p>
                  <p className="text-[12px] text-[#8A8A8A]">{popup.match.buyer.name}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: "#F8FAFE", border: "1px solid rgba(6,182,212,0.12)" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0D9488] mb-1">Seller</p>
                  <p className="text-[13px] font-semibold text-[#0D0D0D]">{popup.match.seller.company_name}</p>
                  <p className="text-[12px] text-[#8A8A8A]">{popup.match.seller.name}</p>
                </div>
              </div>

              {/* Status */}
              {(() => {
                const s = STATUS_COLORS[popup.match.status] ?? STATUS_COLORS.pending;
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold uppercase tracking-wide text-[#8A8A8A]">Status:</span>
                    <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full capitalize"
                      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                      {popup.match.status.replace(/_/g, " ")}
                    </span>
                  </div>
                );
              })()}

              {popup.match.cancel_reason && (
                <p className="text-[12px] text-[#8A8A8A]">Reason: {popup.match.cancel_reason}</p>
              )}

              {/* Actions */}
              {popup.match.status !== "cancelled" && popup.match.status !== "completed" && (
                <div className="flex gap-2 pt-1 border-t border-[#F3F4F6]">
                  <button
                    onClick={() => cancelMatch(popup.match.id)}
                    disabled={cancelling}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    {cancelling ? "Cancelling…" : "Cancel Match"}
                  </button>
                  <Link
                    href={`/admin/matches`}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-center text-white transition-all hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)" }}
                    onClick={() => setPopup(null)}
                  >
                    View in Matches
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
