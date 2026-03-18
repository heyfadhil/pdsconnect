import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch stats in parallel
  const [
    { count: totalUsers },
    { count: totalEvents },
    { count: activeMatches },
    { count: newEnquiries },
    { count: scheduledMeetings },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }).in("role", ["buyer", "seller"]),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("match_requests").select("*", { count: "exact", head: true }).in("status", ["pending", "awaiting_buyer", "negotiating"]),
    supabase.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("match_requests").select("*", { count: "exact", head: true }).eq("status", "scheduled"),
  ]);

  // Stalled negotiations count
  const { data: sysSettings } = await supabase
    .from("system_settings")
    .select("negotiation_reminder_hours")
    .single();
  const reminderHours = sysSettings?.negotiation_reminder_hours ?? 24;
  const stalledThreshold = new Date(Date.now() - reminderHours * 60 * 60 * 1000).toISOString();
  const { count: stalledNegotiations } = await supabase
    .from("time_negotiations")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")
    .lt("created_at", stalledThreshold);

  // Recent events
  const { data: recentEvents } = await supabase
    .from("events")
    .select("id, name, status, event_start_date, event_end_date")
    .order("created_at", { ascending: false })
    .limit(5);

  // Recent enquiries
  const { data: recentEnquiries } = await supabase
    .from("enquiries")
    .select("id, full_name, company_name, role_interest, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const statusColors: Record<string, string> = {
    draft: "bg-pale-blue-tint text-calm-blue",
    live: "bg-green-50 text-green-700",
    closed: "bg-gray-100 text-mid-gray",
    new: "bg-sky-blue/10 text-calm-blue",
    contacted: "bg-yellow-50 text-yellow-700",
    account_created: "bg-blue-50 text-deep-blue",
    onboarded: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-600",
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your PDS Connect platform."
        action={
          <Link
            href="/admin/events/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors duration-fast"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Event
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <StatCard
          label="Total Users"
          value={totalUsers ?? 0}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>}
        />
        <StatCard
          label="Events"
          value={totalEvents ?? 0}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
        />
        <StatCard
          label="Active Matches"
          value={activeMatches ?? 0}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 3.17a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>}
          accent
        />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <StatCard
          label="Scheduled Meetings"
          value={scheduledMeetings ?? 0}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
        />
        <StatCard
          label="New Enquiries"
          value={newEnquiries ?? 0}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>}
        />
        {(stalledNegotiations ?? 0) > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">Stalled Negotiations</p>
              <p className="text-2xl font-bold text-amber-700">{stalledNegotiations}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Events */}
        <div className="bg-white rounded-2xl border border-light-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-heading-4 font-semibold text-carbon-black">Recent Events</h2>
            <Link href="/admin/events" className="text-body-sm text-calm-blue font-semibold hover:text-deep-blue transition-colors">View all →</Link>
          </div>
          {!recentEvents?.length ? (
            <p className="text-body-sm text-mid-gray py-4 text-center">No events yet. <Link href="/admin/events/new" className="text-calm-blue font-semibold">Create one →</Link></p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentEvents.map((ev) => (
                <Link key={ev.id} href={`/admin/events/${ev.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-off-white transition-colors group">
                  <div>
                    <p className="text-sm font-semibold text-carbon-black group-hover:text-calm-blue transition-colors">{ev.name}</p>
                    <p className="text-[12px] text-mid-gray mt-0.5">{ev.event_start_date ? new Date(ev.event_start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "No date set"}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[ev.status] ?? "bg-gray-100 text-mid-gray"}`}>{ev.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white rounded-2xl border border-light-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-heading-4 font-semibold text-carbon-black">Recent Enquiries</h2>
            <Link href="/admin/enquiries" className="text-body-sm text-calm-blue font-semibold hover:text-deep-blue transition-colors">View all →</Link>
          </div>
          {!recentEnquiries?.length ? (
            <p className="text-body-sm text-mid-gray py-4 text-center">No enquiries yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentEnquiries.map((enq) => (
                <Link key={enq.id} href={`/admin/enquiries`} className="flex items-center justify-between p-3 rounded-xl hover:bg-off-white transition-colors group">
                  <div>
                    <p className="text-sm font-semibold text-carbon-black group-hover:text-calm-blue transition-colors">{enq.company_name}</p>
                    <p className="text-[12px] text-mid-gray mt-0.5">{enq.full_name} · {enq.role_interest}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[enq.status] ?? "bg-gray-100 text-mid-gray"}`}>{enq.status.replace("_", " ")}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
