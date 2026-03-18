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
  role_in_event: "buyer" | "procurer";
}

export default function BuyerDashboard() {
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
      <div className="flex items-center justify-center h-64 text-mid-gray text-body-md">
        Loading your events…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display font-bold text-heading-2 text-ink-gray">Dashboard</h1>
        <p className="text-body-md text-mid-gray mt-1">
          Your events and matches as a Buyer.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-mid-gray">
          <CalendarDays size={40} strokeWidth={1.2} />
          <p className="text-body-md">You have not been assigned to any events yet.</p>
          <p className="text-body-sm">Check back once the admin has added you to an event.</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <h2 className="font-display font-semibold text-heading-3 text-ink-gray mb-4">
                Active Events
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((e) => (
                  <EventCard key={e.id} event={{ ...e, role_in_event: "buyer" }} />
                ))}
              </div>
            </section>
          )}

          {archived.length > 0 && (
            <section>
              <h2 className="font-display font-semibold text-heading-3 text-ink-gray mb-4">
                Archived Events
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {archived.map((e) => (
                  <EventCard key={e.id} event={{ ...e, role_in_event: "buyer" }} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
