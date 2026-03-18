"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";

type Slot = { id: string; start_time: string; end_time: string; is_booked: boolean };

export default function TimeSlotsPage() {
  const { id } = useParams<{ id: string }>();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ start_time: "", end_time: "" });
  const [bulkDate, setBulkDate] = useState("");
  const [bulkInterval, setBulkInterval] = useState("30");
  const [bulkStart, setBulkStart] = useState("09:00");
  const [bulkEnd, setBulkEnd] = useState("17:00");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchSlots = async () => {
    const res = await fetch(`/api/admin/events/${id}/slots`);
    const data = await res.json();
    setSlots(data.slots ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchSlots(); }, [id]);

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.start_time || !form.end_time) return;
    setSaving(true);
    await fetch(`/api/admin/events/${id}/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots: [{ start_time: form.start_time, end_time: form.end_time }] }),
    });
    setForm({ start_time: "", end_time: "" });
    fetchSlots();
    setSaving(false);
  };

  const generateBulk = async () => {
    if (!bulkDate) { setError("Please select a date."); return; }
    setError("");
    setSaving(true);
    const interval = parseInt(bulkInterval);
    const slots: { start_time: string; end_time: string }[] = [];
    let cursor = new Date(`${bulkDate}T${bulkStart}:00`);
    const endLimit = new Date(`${bulkDate}T${bulkEnd}:00`);
    while (cursor < endLimit) {
      const next = new Date(cursor.getTime() + interval * 60000);
      if (next > endLimit) break;
      slots.push({ start_time: cursor.toISOString(), end_time: next.toISOString() });
      cursor = next;
    }
    await fetch(`/api/admin/events/${id}/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots }),
    });
    fetchSlots();
    setSaving(false);
  };

  const deleteSlot = async (slotId: string) => {
    await fetch(`/api/admin/events/${id}/slots/${slotId}`, { method: "DELETE" });
    fetchSlots();
  };

  const byDate = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    const d = new Date(s.start_time).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    (acc[d] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-3xl">
      <PageHeader
        title="Time Slots"
        description="Define the available meeting slots for this event."
        action={<Link href={`/admin/events/${id}`} className="text-sm text-mid-gray hover:text-ink-gray transition-colors">← Back to Event</Link>}
      />

      {/* Bulk generator */}
      <div className="bg-white rounded-2xl border border-light-border p-6 shadow-sm mb-6">
        <h2 className="font-display text-heading-4 font-semibold text-carbon-black mb-4">Bulk Generate Slots</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-[12px] font-semibold text-mid-gray uppercase tracking-wide mb-1">Date</label>
            <input type="date" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} className="w-full h-10 px-3 rounded-lg border-[1.5px] border-light-border text-sm focus:outline-none focus:border-calm-blue transition-all" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-mid-gray uppercase tracking-wide mb-1">Start Time</label>
            <input type="time" value={bulkStart} onChange={(e) => setBulkStart(e.target.value)} className="w-full h-10 px-3 rounded-lg border-[1.5px] border-light-border text-sm focus:outline-none focus:border-calm-blue transition-all" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-mid-gray uppercase tracking-wide mb-1">End Time</label>
            <input type="time" value={bulkEnd} onChange={(e) => setBulkEnd(e.target.value)} className="w-full h-10 px-3 rounded-lg border-[1.5px] border-light-border text-sm focus:outline-none focus:border-calm-blue transition-all" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-mid-gray uppercase tracking-wide mb-1">Interval (min)</label>
            <select value={bulkInterval} onChange={(e) => setBulkInterval(e.target.value)} className="w-full h-10 px-3 rounded-lg border-[1.5px] border-light-border text-sm focus:outline-none focus:border-calm-blue transition-all">
              {["15", "20", "30", "45", "60"].map((v) => <option key={v} value={v}>{v} min</option>)}
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button onClick={generateBulk} disabled={saving} className="px-5 py-2 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors disabled:opacity-50">
          Generate Slots
        </button>
      </div>

      {/* Manual add */}
      <form onSubmit={addSlot} className="bg-white rounded-2xl border border-light-border p-6 shadow-sm mb-6">
        <h2 className="font-display text-heading-4 font-semibold text-carbon-black mb-4">Add Single Slot</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-[12px] font-semibold text-mid-gray uppercase tracking-wide mb-1">Start</label>
            <input type="datetime-local" value={form.start_time} onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))} className="w-full h-10 px-3 rounded-lg border-[1.5px] border-light-border text-sm focus:outline-none focus:border-calm-blue transition-all" />
          </div>
          <div className="flex-1">
            <label className="block text-[12px] font-semibold text-mid-gray uppercase tracking-wide mb-1">End</label>
            <input type="datetime-local" value={form.end_time} onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))} className="w-full h-10 px-3 rounded-lg border-[1.5px] border-light-border text-sm focus:outline-none focus:border-calm-blue transition-all" />
          </div>
          <button type="submit" disabled={saving} className="px-5 h-10 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors disabled:opacity-50">Add</button>
        </div>
      </form>

      {/* Slot list */}
      <div className="bg-white rounded-2xl border border-light-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-light-border flex items-center justify-between">
          <h2 className="font-display text-heading-4 font-semibold text-carbon-black">All Slots</h2>
          <span className="text-body-sm text-mid-gray">{slots.length} total</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-mid-gray text-sm">Loading...</div>
        ) : !slots.length ? (
          <div className="p-8 text-center text-mid-gray text-sm">No slots yet. Use the generator above.</div>
        ) : (
          <div className="divide-y divide-light-border">
            {Object.entries(byDate).map(([date, daySlots]) => (
              <div key={date}>
                <div className="px-6 py-2.5 bg-off-white">
                  <p className="text-[11px] font-semibold text-mid-gray uppercase tracking-wide">{date}</p>
                </div>
                {daySlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between px-6 py-3 hover:bg-off-white transition-colors">
                    <span className="text-sm font-medium text-carbon-black">
                      {new Date(slot.start_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      {" — "}
                      {new Date(slot.end_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <div className="flex items-center gap-3">
                      {slot.is_booked ? (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">Booked</span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-pale-blue-tint text-calm-blue">Available</span>
                      )}
                      {!slot.is_booked && (
                        <button onClick={() => deleteSlot(slot.id)} className="text-xs text-red-500 hover:text-red-700 transition-colors font-semibold">Delete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
