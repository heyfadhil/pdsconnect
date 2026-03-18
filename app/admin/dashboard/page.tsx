import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/admin/StatCard";
import Link from "next/link";

const statusStyle: Record<string, { bg: string; color: string }> = {
  draft:           { bg: "#EEF5FC", color: "#2E7FD9" },
  live:            { bg: "#ECFDF5", color: "#059669" },
  closed:          { bg: "#F3F4F6", color: "#6B7280" },
  new:             { bg: "#EEF5FC", color: "#2E7FD9" },
  contacted:       { bg: "#FFFBEB", color: "#D97706" },
  account_created: { bg: "#EFF6FF", color: "#1A5FAA" },
  onboarded:       { bg: "#ECFDF5", color: "#059669" },
  rejected:        { bg: "#FEF2F2", color: "#DC2626" },
};

export default async function AdminDashboard() {
  const supabase = await createClient();

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

  const { data: sysSettings } = await supabase.from("system_settings").select("negotiation_reminder_hours").single();
  const reminderHours = sysSettings?.negotiation_reminder_hours ?? 24;
  const stalledThreshold = new Date(Date.now() - reminderHours * 60 * 60 * 1000).toISOString();
  const { count: stalledNegotiations } = await supabase
    .from("time_negotiations").select("id", { count: "exact", head: true })
    .eq("status", "pending").lt("created_at", stalledThreshold);

  const { data: recentEvents } = await supabase
    .from("events").select("id, name, status, event_start_date")
    .order("created_at", { ascending: false }).limit(5);

  const { data: recentEnquiries } = await supabase
    .from("enquiries").select("id, full_name, company_name, role_interest, status, created_at")
    .order("created_at", { ascending: false }).limit(5);

  return (
    <div className="p-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.10em] text-[#8A8A8A] mb-1">Overview</p>
          <h1 className="font-display text-[28px] font-bold text-[#0D0D0D] leading-tight tracking-[-0.01em]">
            PDS Connect
          </h1>
        </div>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #1A5FAA 100%)", boxShadow: "0 4px 14px rgba(46,127,217,0.30)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Event
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard label="Total Users" value={totalUsers ?? 0}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>}
        />
        <StatCard label="Events" value={totalEvents ?? 0}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
        />
        <StatCard label="Active Matches" value={activeMatches ?? 0} accent
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 3.17a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>}
        />
        <StatCard label="Scheduled Meetings" value={scheduledMeetings ?? 0}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
        />
        <StatCard label="New Enquiries" value={newEnquiries ?? 0}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>}
        />
        {/* Stalled alert card */}
        {(stalledNegotiations ?? 0) > 0 ? (
          <Link href="/admin/matches" className="rounded-2xl p-6 flex flex-col gap-4 transition-all hover:-translate-y-0.5"
            style={{ background: "#FFFBEB", border: "1px solid #FDE68A", boxShadow: "0 2px 12px rgba(217,119,6,0.10)" }}>
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: "10px", background: "#FEF3C7" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <p className="font-display font-bold leading-none" style={{ fontSize: "34px", color: "#92400E", letterSpacing: "-0.02em" }}>{stalledNegotiations}</p>
              <p className="text-[13px] font-medium mt-1.5" style={{ color: "#B45309" }}>Stalled Negotiations</p>
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl p-6 flex flex-col justify-center items-center gap-2"
            style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", boxShadow: "0 2px 12px rgba(5,150,105,0.06)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            <p className="text-[13px] font-semibold" style={{ color: "#065F46" }}>All Negotiations On Track</p>
          </div>
        )}
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent Events */}
        <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #D8E6F5", boxShadow: "0 2px 12px rgba(46,127,217,0.06)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-[17px] font-semibold text-[#0D0D0D]">Recent Events</h2>
            <Link href="/admin/events" className="text-[13px] font-semibold text-[#2E7FD9] hover:text-[#1A5FAA] transition-colors">View all →</Link>
          </div>
          {!recentEvents?.length ? (
            <div className="py-8 text-center">
              <p className="text-[14px] text-[#8A8A8A] mb-3">No events yet.</p>
              <Link href="/admin/events/new" className="text-[13px] font-semibold text-[#2E7FD9] hover:text-[#1A5FAA]">Create your first event →</Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recentEvents.map((ev) => {
                const s = statusStyle[ev.status] ?? { bg: "#F3F4F6", color: "#6B7280" };
                return (
                  <Link key={ev.id} href={`/admin/events/${ev.id}`}
                    className="flex items-center justify-between px-3 py-3 rounded-xl transition-colors group hover:bg-[#F0F7FF]"
                  >
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#0D0D0D] group-hover:text-[#2E7FD9] transition-colors truncate">{ev.name}</p>
                      <p className="text-[12px] text-[#8A8A8A] mt-0.5">
                        {ev.event_start_date ? new Date(ev.event_start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "No date set"}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ml-3"
                      style={{ background: s.bg, color: s.color }}>{ev.status}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Enquiries */}
        <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #D8E6F5", boxShadow: "0 2px 12px rgba(46,127,217,0.06)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-[17px] font-semibold text-[#0D0D0D]">Recent Enquiries</h2>
            <Link href="/admin/enquiries" className="text-[13px] font-semibold text-[#2E7FD9] hover:text-[#1A5FAA] transition-colors">View all →</Link>
          </div>
          {!recentEnquiries?.length ? (
            <div className="py-8 text-center">
              <p className="text-[14px] text-[#8A8A8A]">No enquiries yet.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentEnquiries.map((enq) => {
                const s = statusStyle[enq.status] ?? { bg: "#F3F4F6", color: "#6B7280" };
                return (
                  <Link key={enq.id} href="/admin/enquiries"
                    className="flex items-center justify-between px-3 py-3 rounded-xl transition-colors group hover:bg-[#F0F7FF]"
                  >
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#0D0D0D] group-hover:text-[#2E7FD9] transition-colors truncate">{enq.company_name}</p>
                      <p className="text-[12px] text-[#8A8A8A] mt-0.5">{enq.full_name} · <span className="capitalize">{enq.role_interest}</span></p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ml-3"
                      style={{ background: s.bg, color: s.color }}>{enq.status.replace(/_/g, " ")}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
