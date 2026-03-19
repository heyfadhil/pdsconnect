"use client";

import { useEffect, useState, use, useCallback } from "react";
import { Handshake, Calendar, Clock, ChevronRight, X, Check, RefreshCw, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
}

interface Negotiation {
  id: string;
  proposed_by: "buyer" | "seller";
  status: string;
  expires_at: string;
  time_slots: TimeSlot | null;
}

interface User {
  id: string;
  name: string;
  company_name: string;
  logo_url?: string | null;
  industries?: { name: string } | null;
}

interface Match {
  id: string;
  status: string;
  cancel_reason?: string | null;
  buyer: User;
  seller: User;
  booked_slot?: TimeSlot | null;
  time_negotiations: Negotiation[];
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSlot(slot: TimeSlot) {
  const start = new Date(slot.start_time);
  const end = new Date(slot.end_time);
  const date = start.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const time = `${start.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}`;
  return { date, time };
}

function getLatestPendingNeg(negs: Negotiation[]) {
  return negs
    .filter((n) => n.status === "pending")
    .sort((a, b) => b.expires_at.localeCompare(a.expires_at))
    .at(0) ?? null;
}

// ─── Status config for buyer ──────────────────────────────────────────────────

function getStatusConfig(match: Match) {
  const pendingNeg = getLatestPendingNeg(match.time_negotiations);

  switch (match.status) {
    case "pending":
      return {
        label: "Match Sent",
        sublabel: "Waiting for seller to respond",
        color: "#F59E0B",
        bg: "rgba(245,158,11,.12)",
        border: "rgba(245,158,11,.25)",
        dot: "#F59E0B",
      };
    case "awaiting_buyer":
      return {
        label: "Date Proposed",
        sublabel: "Seller has proposed a meeting time",
        color: "#06B6D4",
        bg: "rgba(6,182,212,.12)",
        border: "rgba(6,182,212,.25)",
        dot: "#06B6D4",
        needsAction: true,
      };
    case "negotiating":
      if (pendingNeg?.proposed_by === "seller") {
        return {
          label: "New Date Proposed",
          sublabel: "Seller suggested a different time",
          color: "#8B5CF6",
          bg: "rgba(139,92,246,.12)",
          border: "rgba(139,92,246,.25)",
          dot: "#8B5CF6",
          needsAction: true,
        };
      }
      return {
        label: "Counter-Proposed",
        sublabel: "Waiting for seller to respond",
        color: "#06B6D4",
        bg: "rgba(6,182,212,.10)",
        border: "rgba(6,182,212,.20)",
        dot: "#06B6D4",
      };
    case "scheduled":
      return {
        label: "Meeting Confirmed",
        sublabel: "Your meeting is booked",
        color: "#10B981",
        bg: "rgba(16,185,129,.12)",
        border: "rgba(16,185,129,.25)",
        dot: "#10B981",
      };
    case "declined":
      return {
        label: "Declined",
        sublabel: match.cancel_reason ?? "The seller declined this request",
        color: "#EF4444",
        bg: "rgba(239,68,68,.10)",
        border: "rgba(239,68,68,.20)",
        dot: "#EF4444",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        sublabel: match.cancel_reason ?? "This match was cancelled",
        color: "#9CA3AF",
        bg: "rgba(156,163,175,.10)",
        border: "rgba(156,163,175,.20)",
        dot: "#9CA3AF",
      };
    default:
      return {
        label: match.status,
        sublabel: "",
        color: "#9CA3AF",
        bg: "rgba(156,163,175,.10)",
        border: "rgba(156,163,175,.20)",
        dot: "#9CA3AF",
      };
  }
}

// ─── Match List Item ──────────────────────────────────────────────────────────

function MatchItem({
  match,
  slots,
  onAction,
  myRole,
}: {
  match: Match;
  slots: TimeSlot[];
  onAction: (matchId: string, action: string, slotId?: string) => Promise<void>;
  myRole: "buyer" | "seller";
}) {
  const [expanded, setExpanded] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);

  const counterpart = myRole === "buyer" ? match.seller : match.buyer;
  const cfg = getStatusConfig(match);
  const pendingNeg = getLatestPendingNeg(match.time_negotiations);
  const proposedSlot = pendingNeg?.time_slots ?? null;
  const needsAction = (cfg as { needsAction?: boolean }).needsAction;

  async function handle(action: string, slotId?: string) {
    setLoading(true);
    await onAction(match.id, action, slotId);
    setLoading(false);
    setSuggestOpen(false);
    setExpanded(false);
  }

  const initial = counterpart.company_name.charAt(0).toUpperCase();

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        boxShadow: needsAction ? "0 0 0 2px rgba(6,182,212,.20), 0 2px 12px rgba(0,0,0,.06)" : "0 1px 4px rgba(0,0,0,.06)",
      }}
    >
      {/* Main row */}
      <button
        className="w-full text-left flex items-center gap-3 p-4"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Logo */}
        {counterpart.logo_url ? (
          <img
            src={counterpart.logo_url}
            alt={counterpart.company_name}
            className="w-11 h-11 rounded-xl object-contain flex-shrink-0"
            style={{ border: "1px solid #E5E7EB", background: "#F8FAFE" }}
          />
        ) : (
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#2E7FD9,#06B6D4)" }}
          >
            {initial}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[14px] text-[#0D0D0D] truncate leading-tight">
            {counterpart.company_name}
          </p>
          {counterpart.industries?.name && (
            <p className="text-[11px] text-[#8A8A8A] mt-0.5">{counterpart.industries.name}</p>
          )}
        </div>

        {/* Status badge + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            {cfg.label}
          </span>
          <ChevronRight
            size={16}
            className="text-[#C0C0C0] transition-transform"
            style={{ transform: expanded ? "rotate(90deg)" : "none" }}
          />
        </div>
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t border-[#F3F4F6] px-4 pb-4 pt-3 flex flex-col gap-3">

          {/* Status description */}
          <p className="text-[12px] text-[#6B7280]">{cfg.sublabel}</p>

          {/* Confirmed slot */}
          {match.status === "scheduled" && match.booked_slot && (() => {
            const { date, time } = formatSlot(match.booked_slot);
            return (
              <div
                className="rounded-xl p-3 flex flex-col gap-1"
                style={{ background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.20)" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#059669" }}>Confirmed Meeting</p>
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0D0D0D]">
                  <Calendar size={13} style={{ color: "#059669" }} />
                  {date}
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-[#4B5563]">
                  <Clock size={13} style={{ color: "#059669" }} />
                  {time}
                </div>
              </div>
            );
          })()}

          {/* Proposed slot (awaiting_buyer or negotiating with seller's proposal) */}
          {proposedSlot && (match.status === "awaiting_buyer" || (match.status === "negotiating" && pendingNeg?.proposed_by === "seller")) && (() => {
            const { date, time } = formatSlot(proposedSlot);
            return (
              <div
                className="rounded-xl p-3 flex flex-col gap-1"
                style={{ background: "rgba(6,182,212,.07)", border: "1px solid rgba(6,182,212,.20)" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#0E7490" }}>Proposed by Seller</p>
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0D0D0D]">
                  <Calendar size={13} style={{ color: "#06B6D4" }} />
                  {date}
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-[#4B5563]">
                  <Clock size={13} style={{ color: "#06B6D4" }} />
                  {time}
                </div>
              </div>
            );
          })()}

          {/* Buyer's counter-proposal pending */}
          {match.status === "negotiating" && pendingNeg?.proposed_by === "buyer" && pendingNeg.time_slots && (() => {
            const { date, time } = formatSlot(pendingNeg.time_slots);
            return (
              <div
                className="rounded-xl p-3 flex flex-col gap-1"
                style={{ background: "rgba(245,158,11,.07)", border: "1px solid rgba(245,158,11,.20)" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#B45309" }}>Your Proposal — Waiting</p>
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0D0D0D]">
                  <Calendar size={13} style={{ color: "#F59E0B" }} />
                  {date}
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-[#4B5563]">
                  <Clock size={13} style={{ color: "#F59E0B" }} />
                  {time}
                </div>
              </div>
            );
          })()}

          {/* Action buttons */}
          {!suggestOpen ? (
            <div className="flex flex-wrap gap-2">

              {/* Confirm seller's proposal */}
              {(match.status === "awaiting_buyer" || (match.status === "negotiating" && pendingNeg?.proposed_by === "seller")) && (
                <button
                  onClick={() => handle("accept")}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-[13px] font-bold disabled:opacity-50 active:scale-[.98] transition-transform"
                  style={{ background: "linear-gradient(135deg,#059669,#10B981)", boxShadow: "0 3px 10px rgba(16,185,129,.30)" }}
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Confirm Time
                </button>
              )}

              {/* Propose new date */}
              {(match.status === "awaiting_buyer" || (match.status === "negotiating" && pendingNeg?.proposed_by === "seller")) && (
                <button
                  onClick={() => setSuggestOpen(true)}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-50 active:scale-[.98] transition-transform"
                  style={{ background: "rgba(6,182,212,.10)", color: "#0E7490", border: "1px solid rgba(6,182,212,.25)" }}
                >
                  <RefreshCw size={13} />
                  Propose New Time
                </button>
              )}

              {/* Cancel (buyer can cancel when pending) */}
              {match.status === "pending" && (
                <button
                  onClick={() => handle("cancel")}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold disabled:opacity-50 active:scale-[.98] transition-transform"
                  style={{ background: "rgba(239,68,68,.08)", color: "#DC2626", border: "1px solid rgba(239,68,68,.18)" }}
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                  Cancel Request
                </button>
              )}

              {/* Reject (buyer can reject a proposed time) */}
              {(match.status === "awaiting_buyer" || (match.status === "negotiating" && pendingNeg?.proposed_by === "seller")) && (
                <button
                  onClick={() => handle("reject")}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold disabled:opacity-50"
                  style={{ color: "#9CA3AF" }}
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                  Decline
                </button>
              )}
            </div>
          ) : (
            /* Suggest new time picker */
            <div className="flex flex-col gap-2.5">
              <p className="text-[12px] font-semibold text-[#0D0D0D]">Select a new time slot:</p>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]"
              >
                <option value="">Choose a slot…</option>
                {slots.map((s) => {
                  const { date, time } = formatSlot(s);
                  return <option key={s.id} value={s.id}>{date} · {time}</option>;
                })}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => selectedSlot && handle("suggest-time", selectedSlot)}
                  disabled={!selectedSlot || loading}
                  className="flex-1 py-2.5 rounded-xl text-white text-[13px] font-bold disabled:opacity-50 active:scale-[.98] transition-transform"
                  style={{ background: "linear-gradient(135deg,#2E7FD9,#06B6D4)" }}
                >
                  {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Send Proposal"}
                </button>
                <button
                  onClick={() => setSuggestOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-[13px] text-[#6B7280] border border-[#E5E7EB]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>;
}

export default function BuyerMatchesPage({ params }: Props) {
  const { id: eventId } = use(params);
  const [matches, setMatches] = useState<Match[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"progress" | "completed">("progress");

  const load = useCallback(async () => {
    const [matchRes, slotRes] = await Promise.all([
      fetch(`/api/events/${eventId}/matches`).then((r) => r.json()),
      fetch(`/api/events/${eventId}/slots`).then((r) => r.json()),
    ]);
    setMatches(matchRes.matches ?? []);
    setSlots(slotRes.slots ?? []);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  async function handleAction(matchId: string, action: string, slotId?: string) {
    const res = await fetch(`/api/events/${eventId}/matches/${matchId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, time_slot_id: slotId }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Action failed.");
    }
    await load();
  }

  const IN_PROGRESS = ["pending", "awaiting_buyer", "negotiating"];
  const inProgress = matches.filter((m) => IN_PROGRESS.includes(m.status));
  const completed = matches.filter((m) => !IN_PROGRESS.includes(m.status));
  const current = tab === "progress" ? inProgress : completed;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#06B6D4]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="-mx-6 -mt-8 px-6 pt-10 pb-5 md:mx-0 md:mt-0 md:p-0"
        style={{
          background: "radial-gradient(ellipse at 20% 50%,rgba(6,182,212,.18) 0%,transparent 60%),radial-gradient(ellipse at 80% 30%,rgba(46,127,217,.15) 0%,transparent 60%),#06101E",
        }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[.10em] mb-1 md:hidden" style={{ color: "rgba(0,212,255,.65)" }}>My Matches</p>
        <h1 className="text-[24px] font-black text-white leading-tight md:text-[#0D0D0D] md:text-[22px]" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>
          Match Requests
        </h1>
        <p className="text-[13px] mt-0.5 md:text-[#8A8A8A]" style={{ color: "rgba(255,255,255,.50)" }}>
          {inProgress.length > 0
            ? `${inProgress.length} active request${inProgress.length !== 1 ? "s" : ""}`
            : "No active requests"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 w-fit"
        style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)" }}
      >
        <TabBtn label={`Active${inProgress.length > 0 ? ` (${inProgress.length})` : ""}`} active={tab === "progress"} onClick={() => setTab("progress")} />
        <TabBtn label={`Completed${completed.length > 0 ? ` (${completed.length})` : ""}`} active={tab === "completed"} onClick={() => setTab("completed")} />
      </div>

      {current.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)" }}>
            <Handshake size={26} strokeWidth={1.4} style={{ color: "rgba(255,255,255,.35)" }} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-white">
              {tab === "progress" ? "No active matches yet" : "No completed matches yet"}
            </p>
            <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,.40)" }}>
              {tab === "progress" ? "Start swiping to discover sellers." : "Matches you've completed will appear here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {current.map((m) => (
            <MatchItem
              key={m.id}
              match={m}
              slots={slots}
              onAction={handleAction}
              myRole="buyer"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors"
      style={active
        ? { background: "rgba(6,182,212,.18)", color: "#00D4FF", border: "1px solid rgba(0,212,255,.25)" }
        : { color: "rgba(255,255,255,.45)" }
      }
    >
      {label}
    </button>
  );
}
