"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import Link from "next/link";

type Match = {
  id: string;
  status: string;
  cancel_reason: string | null;
  created_at: string;
  time_slot_id: string | null;
  buyer: { id: string; name: string; company_name: string } | null;
  seller: { id: string; name: string; company_name: string } | null;
  booked_slot: { id: string; start_time: string; end_time: string } | null;
};

type GroupedSlot = {
  date: string;
  matches: Match[];
};

export default function AdminItineraryPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [grouped, setGrouped] = useState<GroupedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [matchRes, eventRes] = await Promise.all([
      fetch(`/api/admin/events/${eventId}/matches`),
      fetch(`/api/admin/events/${eventId}`).catch(() => null),
    ]);
    const { matches } = await matchRes.json();
    if (eventRes?.ok) {
      const ev = await eventRes.json();
      setEventName(ev.event?.name ?? "");
    }

    // Only show scheduled matches with a time slot
    const scheduled = (matches as Match[]).filter(
      (m) => m.status === "scheduled" && m.booked_slot
    );

    // Group by date
    const byDate: Record<string, Match[]> = {};
    for (const m of scheduled) {
      const slot = m.booked_slot as unknown as { start_time: string } | null;
      if (!slot) continue;
      const date = new Date(slot.start_time).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(m);
    }

    // Sort each group by start_time
    const groups = Object.entries(byDate)
      .map(([date, ms]) => ({
        date,
        matches: ms.sort((a, b) => {
          const slotA = a.booked_slot as unknown as { start_time: string } | null;
          const slotB = b.booked_slot as unknown as { start_time: string } | null;
          return new Date(slotA?.start_time ?? 0).getTime() - new Date(slotB?.start_time ?? 0).getTime();
        }),
      }))
      .sort((a, b) => {
        const dateA = (a.matches[0]?.booked_slot as unknown as { start_time: string } | null)?.start_time ?? "";
        const dateB = (b.matches[0]?.booked_slot as unknown as { start_time: string } | null)?.start_time ?? "";
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });

    setGrouped(groups);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (matchId: string) => {
    if (!confirm("Cancel this scheduled meeting?")) return;
    setCancelling(matchId);
    await fetch(`/api/admin/matches/${matchId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Cancelled by admin" }),
    });
    setCancelling(null);
    load();
  };

  const total = grouped.reduce((sum, g) => sum + g.matches.length, 0);

  return (
    <div className="p-8">
      <PageHeader
        title="Master Itinerary"
        description={eventName ? `Scheduled meetings for ${eventName}` : "All scheduled meetings for this event."}
        action={
          <div className="flex gap-3 items-center">
            <a
              href={`/api/admin/events/${eventId}/export?type=schedule`}
              className="px-4 py-2 rounded-lg border border-light-border text-sm font-semibold text-ink-gray hover:border-calm-blue hover:text-calm-blue transition-all"
            >
              Export CSV
            </a>
            <Link
              href={`/admin/events/${eventId}/matches`}
              className="text-sm font-semibold text-calm-blue hover:text-deep-blue transition-colors"
            >
              ← All Matches
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="text-center text-mid-gray py-20">Loading…</div>
      ) : grouped.length === 0 ? (
        <div className="text-center text-mid-gray py-20">
          <p className="text-lg font-semibold mb-2">No scheduled meetings yet.</p>
          <p className="text-sm">Meetings will appear here once both parties confirm a time.</p>
        </div>
      ) : (
        <>
          <p className="text-body-sm text-mid-gray mb-6">{total} scheduled meeting{total !== 1 ? "s" : ""}</p>

          <div className="space-y-8">
            {grouped.map((group) => (
              <div key={group.date}>
                <h2 className="font-display text-heading-4 font-semibold text-carbon-black mb-4">{group.date}</h2>
                <div className="bg-white rounded-2xl border border-light-border shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-light-border bg-off-white">
                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-mid-gray w-32">Time</th>
                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-mid-gray">Buyer</th>
                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-mid-gray">Seller</th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {group.matches.map((m) => {
                        const slot = m.booked_slot as unknown as { start_time: string; end_time: string } | null;
                        const buyer = m.buyer as unknown as { company_name: string; name: string } | null;
                        const seller = m.seller as unknown as { company_name: string; name: string } | null;
                        const startTime = slot
                          ? new Date(slot.start_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                          : "";
                        const endTime = slot
                          ? new Date(slot.end_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                          : "";
                        return (
                          <tr key={m.id} className="border-b border-light-border last:border-0 hover:bg-off-white/60 transition-colors">
                            <td className="px-5 py-4 font-mono text-sm text-carbon-black font-semibold">
                              {startTime}–{endTime}
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-carbon-black">{buyer?.company_name ?? "—"}</p>
                              <p className="text-[12px] text-mid-gray">{buyer?.name}</p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-carbon-black">{seller?.company_name ?? "—"}</p>
                              <p className="text-[12px] text-mid-gray">{seller?.name}</p>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                onClick={() => handleCancel(m.id)}
                                disabled={cancelling === m.id}
                                className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                {cancelling === m.id ? "…" : "Cancel Meeting"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
