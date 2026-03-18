"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/admin/PageHeader";
import Link from "next/link";

type Match = {
  id: string;
  status: string;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
  event_id: string;
  buyer: { id: string; name: string; company_name: string } | null;
  seller: { id: string; name: string; company_name: string } | null;
  booked_slot: { id: string; start_time: string; end_time: string } | null;
  events: { id: string; name: string } | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-sky-blue/10 text-calm-blue",
  awaiting_buyer: "bg-yellow-50 text-yellow-700",
  negotiating: "bg-purple-50 text-purple-700",
  scheduled: "bg-green-50 text-green-700",
  declined: "bg-red-50 text-red-500",
  cancelled: "bg-gray-100 text-mid-gray",
};

const STATUS_OPTIONS = ["all", "pending", "awaiting_buyer", "negotiating", "scheduled", "declined", "cancelled"];

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [extending, setExtending] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/matches?${params}`);
    const json = await res.json();
    setMatches(json.matches ?? []);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (matchId: string) => {
    if (!confirm("Cancel this match request?")) return;
    setCancelling(matchId);
    await fetch(`/api/admin/matches/${matchId}/cancel`, { method: "POST" });
    setCancelling(null);
    load();
  };

  const handleExtend = async (matchId: string) => {
    setExtending(matchId);
    const res = await fetch(`/api/admin/matches/${matchId}/extend`, { method: "POST" });
    const json = await res.json();
    setExtending(null);
    if (json.error) alert(json.error);
    else load();
  };

  const active = ["pending", "awaiting_buyer", "negotiating"];

  return (
    <div className="p-8">
      <PageHeader title="All Matches" description="Global view of match requests across all events." />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-light-border rounded-lg px-4 py-2 text-sm text-carbon-black placeholder:text-mid-gray focus:outline-none focus:ring-2 focus:ring-calm-blue/30 w-60"
        />
        <div className="flex gap-1 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors capitalize ${
                statusFilter === s
                  ? "bg-calm-blue text-white"
                  : "bg-white border border-light-border text-mid-gray hover:text-carbon-black"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-mid-gray py-20">Loading…</div>
      ) : matches.length === 0 ? (
        <div className="text-center text-mid-gray py-20">No matches found.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-light-border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-light-border bg-off-white">
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-mid-gray">Event</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-mid-gray">Buyer</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-mid-gray">Seller</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-mid-gray">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-mid-gray">Scheduled</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-mid-gray">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => {
                const buyer = m.buyer as unknown as { company_name: string; name: string } | null;
                const seller = m.seller as unknown as { company_name: string; name: string } | null;
                const slot = m.booked_slot as unknown as { start_time: string; end_time: string } | null;
                const event = m.events as unknown as { id: string; name: string } | null;
                return (
                  <tr key={m.id} className="border-b border-light-border last:border-0 hover:bg-off-white/60 transition-colors">
                    <td className="px-5 py-4">
                      {event ? (
                        <Link href={`/admin/events/${event.id}`} className="text-calm-blue font-semibold hover:underline text-[13px]">
                          {event.name}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-carbon-black">{buyer?.company_name ?? "—"}</p>
                      <p className="text-[12px] text-mid-gray">{buyer?.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-carbon-black">{seller?.company_name ?? "—"}</p>
                      <p className="text-[12px] text-mid-gray">{seller?.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[m.status] ?? "bg-gray-100 text-mid-gray"}`}>
                        {m.status.replace("_", " ")}
                      </span>
                      {m.cancel_reason && (
                        <p className="text-[11px] text-mid-gray mt-1 max-w-[160px] truncate" title={m.cancel_reason}>{m.cancel_reason}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-carbon-black">
                      {slot
                        ? new Date(slot.start_time).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-[12px] text-mid-gray">
                      {new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 justify-end">
                        {active.includes(m.status) && (
                          <>
                            {m.status === "negotiating" && (
                              <button
                                onClick={() => handleExtend(m.id)}
                                disabled={extending === m.id}
                                className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-pale-blue-tint text-calm-blue hover:bg-sky-blue/20 transition-colors disabled:opacity-50"
                              >
                                {extending === m.id ? "…" : "Extend"}
                              </button>
                            )}
                            <button
                              onClick={() => handleCancel(m.id)}
                              disabled={cancelling === m.id}
                              className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              {cancelling === m.id ? "…" : "Cancel"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
