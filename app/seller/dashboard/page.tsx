"use client";

import { useEffect, useState } from "react";
import EventCard from "@/components/user/EventCard";
import { CalendarDays } from "lucide-react";

interface EventData {
  id: string;
  name: string;
  venue_name?: string | null;
  event_start_date?: string | null;
  event_end_date?: string | null;
  isActive: boolean;
  role_in_event: "buyer" | "seller";
}

export default function SellerDashboard() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/events")
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .finally(() => setLoading(false));
  }, []);

  const active = events.filter((e) => e.isActive);
  const archived = events.filter((e) => !e.isActive);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(216,230,245,0.5)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Header card */}
      <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #1A5FAA 100%)", boxShadow: "0 4px 20px rgba(46,127,217,0.25)" }}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.10em] mb-1" style={{ color: "rgba(255,255,255,0.65)" }}>Welcome back</p>
        <h1 className="font-display text-[24px] font-bold text-white leading-tight">Your Events</h1>
        <p className="text-[14px] mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>
          {events.length === 0 ? "No events assigned yet." : `You are registered in ${events.length} event${events.length !== 1 ? "s" : ""}.`}
        </p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl p-12 flex flex-col items-center gap-4 text-center"
          style={{ background: "#FFFFFF", border: "1px solid #D8E6F5", boxShadow: "0 2px 12px rgba(46,127,217,0.06)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#EEF5FC" }}>
            <CalendarDays size={28} strokeWidth={1.5} color="#2E7FD9" />
          </div>
          <div>
            <p className="text-[16px] font-semibold text-[#0D0D0D] mb-1">No events yet</p>
            <p className="text-[14px] text-[#8A8A8A]">You haven't been assigned to any events. Check back once the admin has added you.</p>
          </div>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                <h2 className="font-display font-semibold text-[18px] text-[#0D0D0D]">Active Events</h2>
                <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full ml-1" style={{ background: "#ECFDF5", color: "#059669" }}>{active.length}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((e) => (
                  <EventCard key={e.id} event={{ ...e, role_in_event: "seller" }} />
                ))}
              </div>
            </section>
          )}

          {archived.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A8A8A]" />
                <h2 className="font-display font-semibold text-[18px] text-[#3A3A3A]">Archived Events</h2>
                <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full ml-1" style={{ background: "#F3F4F6", color: "#6B7280" }}>{archived.length}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {archived.map((e) => (
                  <EventCard key={e.id} event={{ ...e, role_in_event: "seller" }} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
