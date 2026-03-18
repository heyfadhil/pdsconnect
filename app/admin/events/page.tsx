import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/admin/PageHeader";
import Link from "next/link";

const statusStyle: Record<string, string> = {
  draft: "bg-pale-blue-tint text-calm-blue",
  live: "bg-green-50 text-green-700",
  closed: "bg-gray-100 text-mid-gray",
};

export default async function EventsListPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, name, status, event_start_date, event_end_date, matchup_open_date, matchup_close_date")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <PageHeader
        title="Events"
        description="Manage all business matching events."
        action={
          <Link
            href="/admin/events/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Event
          </Link>
        }
      />

      <div className="bg-white rounded-2xl border border-light-border shadow-sm overflow-hidden">
        {!events?.length ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-pale-blue-tint flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2E7FD9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            </div>
            <p className="text-carbon-black font-semibold mb-1">No events yet</p>
            <p className="text-mid-gray text-sm mb-5">Create your first event to get started.</p>
            <Link href="/admin/events/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors">
              Create Event
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-light-border">
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-mid-gray uppercase tracking-[0.08em]">Event Name</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-mid-gray uppercase tracking-[0.08em]">Status</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-mid-gray uppercase tracking-[0.08em]">Event Dates</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-mid-gray uppercase tracking-[0.08em]">Matchup Window</th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-off-white transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/events/${ev.id}`} className="text-sm font-semibold text-carbon-black hover:text-calm-blue transition-colors">{ev.name}</Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle[ev.status] ?? "bg-gray-100 text-mid-gray"}`}>{ev.status}</span>
                  </td>
                  <td className="px-6 py-4 text-body-sm text-ink-gray">
                    {ev.event_start_date
                      ? `${new Date(ev.event_start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${new Date(ev.event_end_date ?? ev.event_start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                      : <span className="text-mid-gray">Not set</span>}
                  </td>
                  <td className="px-6 py-4 text-body-sm text-ink-gray">
                    {ev.matchup_open_date
                      ? `${new Date(ev.matchup_open_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${new Date(ev.matchup_close_date ?? ev.matchup_open_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                      : <span className="text-mid-gray">Not set</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/events/${ev.id}`} className="text-xs font-semibold text-calm-blue hover:text-deep-blue transition-colors">Manage →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
