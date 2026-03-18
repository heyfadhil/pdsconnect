"use client";

import { useState } from "react";
import CountdownTimer from "./CountdownTimer";
import { Building2 } from "lucide-react";

type MatchStatus =
  | "pending"
  | "awaiting_buyer"
  | "negotiating"
  | "scheduled"
  | "declined"
  | "cancelled";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
}

interface Negotiation {
  id: string;
  proposed_by: "buyer" | "procurer";
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
  status: MatchStatus;
  cancel_reason?: string | null;
  buyer: User;
  procurer: User;
  booked_slot?: TimeSlot | null;
  time_negotiations: Negotiation[];
}

interface Props {
  match: Match;
  myRole: "buyer" | "procurer";
  myUserId: string;
  eventId: string;
  availableSlots: TimeSlot[];
  onAction: (matchId: string, action: string, slotId?: string) => Promise<void>;
}

const STATUS_LABELS: Record<MatchStatus, string> = {
  pending: "Pending",
  awaiting_buyer: "Awaiting Your Response",
  negotiating: "Negotiating",
  scheduled: "Scheduled",
  declined: "Declined",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<MatchStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  awaiting_buyer: "bg-blue-50 text-blue-700",
  negotiating: "bg-purple-50 text-purple-700",
  scheduled: "bg-emerald-50 text-emerald-700",
  declined: "bg-red-50 text-red-600",
  cancelled: "bg-mid-gray/10 text-mid-gray",
};

function formatSlot(slot: TimeSlot) {
  const start = new Date(slot.start_time);
  const end = new Date(slot.end_time);
  return `${start.toLocaleDateString("en-MY", { day: "numeric", month: "short" })} · ${start.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function MatchCard({
  match,
  myRole,
  myUserId,
  eventId,
  availableSlots,
  onAction,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");

  const counterpart = myRole === "buyer" ? match.procurer : match.buyer;

  const pendingNeg = match.time_negotiations
    .filter((n) => n.status === "pending")
    .sort((a, b) => a.expires_at.localeCompare(b.expires_at))
    .at(-1);

  // Determine what the current user can do
  const isBuyer = myRole === "buyer";
  const canCancel = isBuyer && match.status === "pending";
  const canAccept =
    (isBuyer && match.status === "awaiting_buyer") ||
    (isBuyer && match.status === "negotiating" && pendingNeg?.proposed_by === "procurer") ||
    (!isBuyer && match.status === "negotiating" && pendingNeg?.proposed_by === "buyer");
  const canReject = isBuyer && ["awaiting_buyer", "negotiating"].includes(match.status);
  const canSuggest =
    (isBuyer &&
      (match.status === "awaiting_buyer" ||
        (match.status === "negotiating" && pendingNeg?.proposed_by === "procurer"))) ||
    (!isBuyer && match.status === "negotiating" && pendingNeg?.proposed_by === "buyer");

  async function handle(action: string, slotId?: string) {
    setLoading(true);
    await onAction(match.id, action, slotId);
    setLoading(false);
    setSuggestOpen(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-light-border p-5 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {counterpart.logo_url ? (
            <img
              src={counterpart.logo_url}
              alt={counterpart.company_name}
              className="w-10 h-10 rounded-lg object-contain border border-light-border bg-off-white"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-pale-blue-tint flex items-center justify-center text-calm-blue font-bold">
              {counterpart.company_name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-body-md text-ink-gray leading-snug">
              {counterpart.company_name}
            </p>
            {counterpart.industries?.name && (
              <p className="text-body-sm text-mid-gray flex items-center gap-1">
                <Building2 size={11} />
                {counterpart.industries.name}
              </p>
            )}
          </div>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-label font-semibold uppercase tracking-wide shrink-0 ${STATUS_COLORS[match.status]}`}
        >
          {STATUS_LABELS[match.status]}
        </span>
      </div>

      {/* Proposed / booked slot */}
      {match.status === "scheduled" && match.booked_slot && (
        <div className="px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-body-sm text-emerald-700 font-medium">
          Confirmed: {formatSlot(match.booked_slot)}
        </div>
      )}

      {(match.status === "awaiting_buyer" || match.status === "negotiating") && pendingNeg?.time_slots && (
        <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl text-body-sm text-blue-700 font-medium flex items-center justify-between gap-2 flex-wrap">
          <span>Proposed: {formatSlot(pendingNeg.time_slots)}</span>
          <CountdownTimer expiresAt={pendingNeg.expires_at} />
        </div>
      )}

      {/* Actions */}
      {(canCancel || canAccept || canReject || canSuggest) && (
        <div className="flex flex-wrap gap-2 pt-1">
          {canAccept && (
            <button
              onClick={() => handle("accept")}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-body-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              Accept
            </button>
          )}
          {canSuggest && (
            <button
              onClick={() => setSuggestOpen((o) => !o)}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-calm-blue text-calm-blue text-body-sm font-medium hover:bg-pale-blue-tint disabled:opacity-50 transition-colors"
            >
              Suggest New Time
            </button>
          )}
          {canReject && (
            <button
              onClick={() => handle("reject")}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-body-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              Reject Meeting
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => handle("cancel")}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-light-border text-mid-gray text-body-sm font-medium hover:bg-off-white disabled:opacity-50 transition-colors"
            >
              Cancel Request
            </button>
          )}
        </div>
      )}

      {/* Suggest time slot picker */}
      {suggestOpen && (
        <div className="border border-light-border rounded-xl p-4 flex flex-col gap-3 bg-off-white">
          <p className="text-body-sm font-semibold text-ink-gray">Select a time slot:</p>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="border border-light-border rounded-lg px-3 py-2 text-body-sm bg-white focus:outline-none focus:ring-2 focus:ring-calm-blue"
          >
            <option value="">Choose a slot...</option>
            {availableSlots.map((s) => (
              <option key={s.id} value={s.id}>
                {formatSlot(s)}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => selectedSlot && handle("suggest-time", selectedSlot)}
              disabled={!selectedSlot || loading}
              className="px-4 py-2 rounded-lg bg-calm-blue text-white text-body-sm font-medium hover:bg-deep-blue disabled:opacity-50 transition-colors"
            >
              Suggest
            </button>
            <button
              onClick={() => setSuggestOpen(false)}
              className="px-4 py-2 rounded-lg border border-light-border text-mid-gray text-body-sm font-medium hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
