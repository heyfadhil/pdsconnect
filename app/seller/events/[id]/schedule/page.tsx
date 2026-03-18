"use client";

import { useEffect, useState, use } from "react";
import { CalendarDays, Download } from "lucide-react";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
}

interface Company {
  id: string;
  name: string;
  company_name: string;
  logo_url?: string | null;
}

interface Meeting {
  id: string;
  buyer: Company;
  seller: Company;
  booked_slot: TimeSlot | null;
}

interface DayGroup {
  date: string;
  meetings: Meeting[];
}

interface Props {
  params: Promise<{ id: string }>;
}

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function downloadPDF(
  schedule: DayGroup[],
  userId: string,
  eventName: string,
  venueName: string | null | undefined
) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("My Schedule", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(eventName, 14, 27);
  if (venueName) doc.text(venueName, 14, 33);

  let y = venueName ? 40 : 34;

  for (const day of schedule) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text(formatDate(day.date), 14, y);
    y += 4;

    const rows = day.meetings.map((m) => {
      const counterpart = m.seller.id === userId ? m.buyer : m.seller;
      const start = m.booked_slot ? formatTime(m.booked_slot.start_time) : "";
      const end = m.booked_slot ? formatTime(m.booked_slot.end_time) : "";
      return [`${start} – ${end}`, counterpart.company_name, counterpart.name];
    });

    autoTable(doc, {
      startY: y,
      head: [["Time", "Company", "Contact"]],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [46, 127, 217], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      tableWidth: pageWidth - 28,
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  doc.save(`schedule_${eventName.replace(/\s+/g, "_").toLowerCase()}.pdf`);
}

export default function SellerSchedulePage({ params }: Props) {
  const { id: eventId } = use(params);
  const [schedule, setSchedule] = useState<DayGroup[]>([]);
  const [event, setEvent] = useState<{ name: string; venue_name?: string | null } | null>(null);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${eventId}/schedule`).then((r) => r.json()),
      fetch("/api/user/profile").then((r) => r.json()),
    ]).then(([sched, prof]) => {
      setSchedule(sched.schedule ?? []);
      setEvent(sched.event ?? null);
      setUserId(prof.profile?.id ?? "");
      setLoading(false);
    });
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-mid-gray">
        Loading schedule…
      </div>
    );
  }

  const totalMeetings = schedule.reduce((sum, d) => sum + d.meetings.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-heading-2 text-ink-gray">My Schedule</h1>
          <p className="text-body-md text-mid-gray mt-1">
            {event?.name} · {totalMeetings} confirmed meeting{totalMeetings !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={async () => {
            setDownloading(true);
            await downloadPDF(schedule, userId, event?.name ?? "Event", event?.venue_name);
            setDownloading(false);
          }}
          disabled={downloading || schedule.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-light-border text-ink-gray text-body-sm font-medium hover:bg-pale-blue-tint transition-colors disabled:opacity-50"
        >
          <Download size={14} />
          {downloading ? "Generating…" : "Download PDF"}
        </button>
      </div>

      {schedule.length === 0 ? (
        <div className="py-20 text-center text-mid-gray flex flex-col items-center gap-3">
          <CalendarDays size={40} strokeWidth={1.2} />
          <p className="text-body-md">No confirmed meetings yet.</p>
          <p className="text-body-sm">
            Confirm match requests in your Inbox to start scheduling.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {schedule.map((day) => (
            <section key={day.date}>
              <h2 className="font-display font-semibold text-heading-4 text-ink-gray mb-3">
                {formatDate(day.date)}
              </h2>
              <div className="bg-white rounded-2xl border border-light-border overflow-hidden shadow-xs">
                <table className="w-full text-body-sm">
                  <thead>
                    <tr className="bg-pale-blue-tint border-b border-light-border">
                      <th className="px-5 py-3 text-left font-semibold text-mid-gray uppercase tracking-wide text-label w-40">
                        Time
                      </th>
                      <th className="px-5 py-3 text-left font-semibold text-mid-gray uppercase tracking-wide text-label">
                        Buyer
                      </th>
                      <th className="px-5 py-3 text-left font-semibold text-mid-gray uppercase tracking-wide text-label hidden sm:table-cell">
                        Venue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.meetings.map((m) => {
                      const counterpart = m.seller.id === userId ? m.buyer : m.seller;
                      return (
                        <tr
                          key={m.id}
                          className="border-b border-light-border last:border-0 hover:bg-off-white"
                        >
                          <td className="px-5 py-4 font-medium text-ink-gray">
                            {m.booked_slot && (
                              <>
                                {formatTime(m.booked_slot.start_time)}
                                <span className="text-mid-gray"> – </span>
                                {formatTime(m.booked_slot.end_time)}
                              </>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {counterpart.logo_url ? (
                                <img
                                  src={counterpart.logo_url}
                                  alt={counterpart.company_name}
                                  className="w-7 h-7 rounded-md object-contain border border-light-border bg-off-white"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-md bg-pale-blue-tint flex items-center justify-center text-calm-blue font-bold text-xs">
                                  {counterpart.company_name.charAt(0)}
                                </div>
                              )}
                              <span className="font-medium text-ink-gray">
                                {counterpart.company_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-mid-gray hidden sm:table-cell">
                            {event?.venue_name ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
