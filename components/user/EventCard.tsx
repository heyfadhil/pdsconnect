import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

interface EventData {
  id: string;
  name: string;
  venue_name?: string | null;
  event_start_date?: string | null;
  event_end_date?: string | null;
  isActive: boolean;
  role_in_event: "buyer" | "seller";
}

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EventCard({ event }: { event: EventData }) {
  const base = `/${event.role_in_event}/events/${event.id}`;
  const start = formatDate(event.event_start_date);
  const end = formatDate(event.event_end_date);
  const dateLabel =
    start && end && start !== end ? `${start} – ${end}` : start ?? "Date TBD";

  return (
    <div
      className={`rounded-2xl border bg-white p-5 flex flex-col gap-4 shadow-xs hover:shadow-md transition-shadow ${
        event.isActive ? "border-calm-blue/30" : "border-light-border"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-semibold text-heading-4 text-ink-gray leading-snug">
          {event.name}
        </h3>
        <span
          className={`shrink-0 px-2.5 py-0.5 rounded-full text-label font-semibold uppercase tracking-widest ${
            event.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-mid-gray/10 text-mid-gray"
          }`}
        >
          {event.isActive ? "Active" : "Archived"}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1.5 text-body-sm text-mid-gray">
        {dateLabel && (
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-calm-blue shrink-0" />
            {dateLabel}
          </div>
        )}
        {event.venue_name && (
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-calm-blue shrink-0" />
            {event.venue_name}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Link
          href={`${base}/discover`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-calm-blue text-white text-body-sm font-medium hover:bg-deep-blue transition-colors"
        >
          Discover
          <ArrowRight size={13} />
        </Link>
        {event.role_in_event === "seller" && (
          <Link
            href={`${base}/inbox`}
            className="px-3 py-1.5 rounded-lg border border-light-border text-ink-gray text-body-sm font-medium hover:bg-pale-blue-tint transition-colors"
          >
            Inbox
          </Link>
        )}
        <Link
          href={`${base}/matches`}
          className="px-3 py-1.5 rounded-lg border border-light-border text-ink-gray text-body-sm font-medium hover:bg-pale-blue-tint transition-colors"
        >
          Matches
        </Link>
        <Link
          href={`${base}/schedule`}
          className="px-3 py-1.5 rounded-lg border border-light-border text-ink-gray text-body-sm font-medium hover:bg-pale-blue-tint transition-colors"
        >
          My Schedule
        </Link>
      </div>
    </div>
  );
}
