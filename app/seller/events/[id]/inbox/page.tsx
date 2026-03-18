"use client";

import { useEffect, useState, use, useCallback } from "react";
import { Inbox, Check, X, Building2, Tag } from "lucide-react";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
}

interface Request {
  id: string;
  status: string;
  created_at: string;
  buyer: {
    id: string;
    name: string;
    company_name: string;
    logo_url?: string | null;
    bio?: string | null;
    tags?: string | null;
    industries?: { name: string } | null;
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

function formatSlot(slot: TimeSlot) {
  const start = new Date(slot.start_time);
  const end = new Date(slot.end_time);
  return `${start.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" })} · ${start.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function SellerInboxPage({ params }: Props) {
  const { id: eventId } = use(params);
  const [requests, setRequests] = useState<Request[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");

  const load = useCallback(async () => {
    const [inboxRes, slotRes] = await Promise.all([
      fetch(`/api/events/${eventId}/inbox`).then((r) => r.json()),
      fetch(`/api/events/${eventId}/slots`).then((r) => r.json()),
    ]);
    setRequests(inboxRes.requests ?? []);
    setSlots((slotRes.slots ?? []).filter((s: TimeSlot & { is_booked: boolean }) => !s.is_booked));
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  async function respond(matchId: string, action: string, slotId?: string) {
    setResponding(matchId);
    const res = await fetch(`/api/events/${eventId}/inbox/${matchId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, time_slot_id: slotId }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Action failed.");
    } else {
      await load();
    }
    setResponding(null);
    setConfirmOpen(null);
    setSelectedSlot("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-mid-gray">
        Loading inbox…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-heading-2 text-ink-gray">Ready to Match</h1>
        <p className="text-body-md text-mid-gray mt-1">
          Buyers who want to meet with you.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="py-20 text-center text-mid-gray flex flex-col items-center gap-3">
          <Inbox size={40} strokeWidth={1.2} />
          <p className="text-body-md">Your inbox is empty.</p>
          <p className="text-body-sm">New match requests will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-w-2xl">
          {requests.map((req) => {
            const tags = (req.buyer.tags ?? "")
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-light-border p-5 flex flex-col gap-4 shadow-xs"
              >
                {/* Buyer info */}
                <div className="flex items-center gap-3">
                  {req.buyer.logo_url ? (
                    <img
                      src={req.buyer.logo_url}
                      alt={req.buyer.company_name}
                      className="w-12 h-12 rounded-xl object-contain border border-light-border bg-off-white"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-pale-blue-tint flex items-center justify-center text-calm-blue font-bold text-lg">
                      {req.buyer.company_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-body-md text-ink-gray">
                      {req.buyer.company_name}
                    </p>
                    {req.buyer.industries?.name && (
                      <div className="flex items-center gap-1 text-body-sm text-mid-gray">
                        <Building2 size={11} />
                        {req.buyer.industries.name}
                      </div>
                    )}
                  </div>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <Tag size={11} className="text-mid-gray mt-0.5 shrink-0" />
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-off-white border border-light-border text-body-sm text-ink-gray rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {req.buyer.bio && (
                  <p className="text-body-sm text-mid-gray line-clamp-2">{req.buyer.bio}</p>
                )}

                {/* Actions */}
                {confirmOpen === req.id ? (
                  <div className="border border-light-border rounded-xl p-4 flex flex-col gap-3 bg-off-white">
                    <p className="text-body-sm font-semibold text-ink-gray">
                      Select a time slot to propose:
                    </p>
                    {slots.length === 0 ? (
                      <p className="text-body-sm text-amber-600">
                        No available time slots. Please contact the admin.
                      </p>
                    ) : (
                      <select
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        className="border border-light-border rounded-lg px-3 py-2 text-body-sm bg-white focus:outline-none focus:ring-2 focus:ring-calm-blue"
                      >
                        <option value="">Choose a slot…</option>
                        {slots.map((s) => (
                          <option key={s.id} value={s.id}>
                            {formatSlot(s)}
                          </option>
                        ))}
                      </select>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          selectedSlot && respond(req.id, "confirm", selectedSlot)
                        }
                        disabled={!selectedSlot || responding === req.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-body-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        <Check size={14} />
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setConfirmOpen(null);
                          setSelectedSlot("");
                        }}
                        className="px-4 py-2 rounded-lg border border-light-border text-mid-gray text-body-sm font-medium hover:bg-white"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmOpen(req.id)}
                      disabled={responding === req.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-body-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      <Check size={14} />
                      Confirm Match
                    </button>
                    <button
                      onClick={() => respond(req.id, "decline")}
                      disabled={responding === req.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-body-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      <X size={14} />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
