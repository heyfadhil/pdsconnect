"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";

type MatchStatus = "pending" | "awaiting_buyer" | "negotiating" | "scheduled" | "declined" | "cancelled";

interface Match {
  id: string;
  status: MatchStatus;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
  buyer: { name: string; company_name: string };
  seller: { name: string; company_name: string };
  booked_slot: { start_time: string; end_time: string } | null;
}

const STATUS_STYLE: Record<MatchStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  awaiting_buyer: "bg-blue-50 text-blue-700",
  negotiating: "bg-purple-50 text-purple-700",
  scheduled: "bg-emerald-50 text-emerald-700",
  declined: "bg-red-50 text-red-600",
  cancelled: "bg-mid-gray/10 text-mid-gray",
};

function formatDt(dt: string) {
  return new Date(dt).toLocaleString("en-MY", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminMatchesPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MatchStatus | "all">("all");

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/events/${eventId}/matches`).then((r) => r.json());
    setMatches(res.matches ?? []);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  const filtered = matches.filter((m) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      m.buyer?.company_name?.toLowerCase().includes(s) ||
      m.seller?.company_name?.toLowerCase().includes(s);
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="p-8 text-mid-gray text-sm">Loading…</div>;

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="text-body-sm text-mid-gray mb-1">
            <Link href={`/admin/events/${eventId}`} className="hover:text-calm-blue">← Event</Link>
          </div>
          <h1 className="font-display text-heading-2 font-bold text-carbon-black">Matches</h1>
          <p className="text-body-sm text-mid-gray mt-1">{matches.length} total match requests</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/admin/events/${eventId}/export?type=matches`}
            className="px-4 py-2 rounded-lg border border-light-border text-sm font-semibold text-ink-gray hover:border-calm-blue hover:text-calm-blue transition-all"
          >
            Export CSV
          </a>
          <Link
            href={`/admin/events/${eventId}/itinerary`}
            className="px-4 py-2 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors"
          >
            Itinerary
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
          <input
            type="text"
            placeholder="Search by company name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-light-border rounded-xl text-body-sm bg-white focus:outline-none focus:ring-2 focus:ring-calm-blue"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MatchStatus | "all")}
          className="px-3 py-2 border border-light-border rounded-xl text-body-sm bg-white focus:outline-none focus:ring-2 focus:ring-calm-blue"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="awaiting_buyer">Awaiting Buyer</option>
          <option value="negotiating">Negotiating</option>
          <option value="scheduled">Scheduled</option>
          <option value="declined">Declined</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-mid-gray text-body-md">
          {matches.length === 0 ? "No match requests yet for this event." : "No matches found."}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-light-border overflow-hidden shadow-sm">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="bg-pale-blue-tint border-b border-light-border">
                <th className="px-5 py-3 text-left text-label font-semibold text-mid-gray uppercase tracking-wide">Buyer</th>
                <th className="px-5 py-3 text-left text-label font-semibold text-mid-gray uppercase tracking-wide">Seller</th>
                <th className="px-5 py-3 text-left text-label font-semibold text-mid-gray uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-label font-semibold text-mid-gray uppercase tracking-wide hidden sm:table-cell">Booked Slot</th>
                <th className="px-5 py-3 text-left text-label font-semibold text-mid-gray uppercase tracking-wide hidden md:table-cell">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-light-border last:border-0 hover:bg-off-white">
                  <td className="px-5 py-3 font-medium text-ink-gray">{m.buyer?.company_name ?? "—"}</td>
                  <td className="px-5 py-3 font-medium text-ink-gray">{m.seller?.company_name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-label font-semibold uppercase tracking-wide ${STATUS_STYLE[m.status]}`}>
                      {m.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-mid-gray hidden sm:table-cell">
                    {m.booked_slot
                      ? formatDt(m.booked_slot.start_time)
                      : "—"}
                  </td>
                  <td className="px-5 py-3 text-mid-gray hidden md:table-cell">
                    {formatDt(m.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
