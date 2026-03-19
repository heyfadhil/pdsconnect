"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import ImageUpload from "@/components/ui/ImageUpload";

type Event = {
  id: string; name: string; description: string | null;
  venue_name: string | null; venue_address: string | null;
  event_start_date: string | null; event_end_date: string | null;
  matchup_open_date: string | null; matchup_close_date: string | null;
  max_matches_per_buyer: number | null; max_matches_per_seller: number | null;
  status: string; thumbnail_url: string | null;
};

const statusStyle: Record<string, string> = {
  draft: "bg-pale-blue-tint text-calm-blue",
  live: "bg-green-50 text-green-700",
  closed: "bg-gray-100 text-mid-gray",
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Event>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/events/${id}`)
      .then((r) => r.json())
      .then(({ event }) => { setEvent(event); setForm(event); setLoading(false); });
  }, [id]);

  const set = (field: keyof Event) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((p) => ({ ...p, [field]: e.target.value || null }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const { event: updated } = await res.json();
      setEvent(updated);
      setEditing(false);
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to save.");
    }
    setSaving(false);
  };

  const handleStatusChange = async (status: string) => {
    const res = await fetch(`/api/admin/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const { event: updated } = await res.json();
      setEvent(updated);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete event "${event?.name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    router.push("/admin/events");
  };

  const inputClass = "w-full h-10 px-3 rounded-lg border-[1.5px] border-light-border bg-white text-ink-gray text-sm focus:outline-none focus:border-calm-blue focus:shadow-[0_0_0_3px_rgba(46,127,217,0.15)] transition-all";
  const labelClass = "block text-[12px] font-semibold text-mid-gray uppercase tracking-wide mb-1";

  if (loading) return <div className="p-8 text-mid-gray text-sm">Loading...</div>;
  if (!event) return <div className="p-8 text-mid-gray text-sm">Event not found.</div>;

  return (
    <div className="p-8 max-w-4xl">
      <PageHeader
        title={event.name}
        description={event.venue_name ?? undefined}
        action={
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-full capitalize ${statusStyle[event.status]}`}>{event.status}</span>
            {!editing && (
              <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-lg border border-light-border text-sm font-semibold text-ink-gray hover:border-calm-blue hover:text-calm-blue transition-all">
                Edit
              </button>
            )}
          </div>
        }
      />

      {/* Quick nav */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {[
          { label: "Time Slots", href: `/admin/events/${id}/slots` },
          { label: "Participants", href: `/admin/events/${id}/participants` },
          { label: "Matches", href: `/admin/events/${id}/matches` },
          { label: "Assign Participants (AI)", href: `/admin/events/${id}/assign` },
          { label: "Itinerary", href: `/admin/events/${id}/itinerary` },
          { label: "Calendar", href: `/admin/events/${id}/calendar` },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="px-4 py-2 rounded-lg bg-white border border-light-border text-sm font-medium text-ink-gray hover:border-calm-blue hover:text-calm-blue transition-all shadow-sm">
            {link.label} →
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Details card */}
        <div className="bg-white rounded-2xl border border-light-border p-6 shadow-sm md:col-span-2">
          <h2 className="font-display text-heading-4 font-semibold text-carbon-black mb-5">Event Details</h2>
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Event Name *</label>
                <input value={form.name ?? ""} onChange={set("name")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea value={form.description ?? ""} onChange={set("description")} rows={3} className={`${inputClass} h-auto py-2.5 resize-none`} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Venue Name</label><input value={form.venue_name ?? ""} onChange={set("venue_name")} className={inputClass} /></div>
                <div><label className={labelClass}>Venue Address</label><input value={form.venue_address ?? ""} onChange={set("venue_address")} className={inputClass} /></div>
                <div><label className={labelClass}>Event Start</label><input type="date" value={form.event_start_date ?? ""} onChange={set("event_start_date")} className={inputClass} /></div>
                <div><label className={labelClass}>Event End</label><input type="date" value={form.event_end_date ?? ""} onChange={set("event_end_date")} className={inputClass} /></div>
                <div><label className={labelClass}>Matchup Opens</label><input type="date" value={form.matchup_open_date ?? ""} onChange={set("matchup_open_date")} className={inputClass} /></div>
                <div><label className={labelClass}>Matchup Closes</label><input type="date" value={form.matchup_close_date ?? ""} onChange={set("matchup_close_date")} className={inputClass} /></div>
                <div><label className={labelClass}>Max Matches / Buyer</label><input type="number" min="1" value={form.max_matches_per_buyer ?? ""} onChange={set("max_matches_per_buyer")} placeholder="No limit" className={inputClass} /></div>
                <div><label className={labelClass}>Max Matches / Seller</label><input type="number" min="1" value={form.max_matches_per_seller ?? ""} onChange={set("max_matches_per_seller")} placeholder="No limit" className={inputClass} /></div>
              </div>
              <div>
                <label className={labelClass}>Event Thumbnail</label>
                <ImageUpload
                  bucket="event-thumbnails"
                  value={form.thumbnail_url ?? ""}
                  onChange={(url) => setForm((p) => ({ ...p, thumbnail_url: url || null }))}
                  label="Upload Thumbnail"
                />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
                <button onClick={() => { setEditing(false); setForm(event); }} className="px-5 py-2 rounded-lg border border-light-border text-sm font-semibold text-ink-gray hover:border-calm-blue transition-all">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: "Venue", value: event.venue_name },
                { label: "Address", value: event.venue_address },
                { label: "Event Start", value: event.event_start_date ? new Date(event.event_start_date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : null },
                { label: "Event End", value: event.event_end_date ? new Date(event.event_end_date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : null },
                { label: "Matchup Opens", value: event.matchup_open_date ? new Date(event.matchup_open_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null },
                { label: "Matchup Closes", value: event.matchup_close_date ? new Date(event.matchup_close_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null },
                { label: "Max Buyer Matches", value: event.max_matches_per_buyer ?? "No limit" },
                { label: "Max Seller Matches", value: event.max_matches_per_seller ?? "No limit" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[12px] font-semibold text-mid-gray uppercase tracking-wide">{label}</p>
                  <p className="text-sm text-carbon-black mt-0.5">{value ?? <span className="text-mid-gray">Not set</span>}</p>
                </div>
              ))}
              {event.description && (
                <div className="md:col-span-2">
                  <p className="text-[12px] font-semibold text-mid-gray uppercase tracking-wide">Description</p>
                  <p className="text-sm text-ink-gray mt-0.5 leading-relaxed">{event.description}</p>
                </div>
              )}
              {event.thumbnail_url && (
                <div className="md:col-span-2">
                  <p className="text-[12px] font-semibold text-mid-gray uppercase tracking-wide mb-1.5">Thumbnail</p>
                  <img src={event.thumbnail_url} alt="Event thumbnail" className="h-28 w-auto rounded-xl border border-light-border object-cover" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status control */}
        <div className="bg-white rounded-2xl border border-light-border p-6 shadow-sm">
          <h2 className="font-display text-heading-4 font-semibold text-carbon-black mb-4">Event Status</h2>
          <div className="flex flex-col gap-2">
            {(["draft", "live", "closed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${event.status === s ? "border-calm-blue bg-pale-blue-tint text-calm-blue" : "border-light-border text-ink-gray hover:border-calm-blue hover:text-calm-blue"}`}
              >
                <span className={`w-2 h-2 rounded-full ${s === "draft" ? "bg-calm-blue" : s === "live" ? "bg-green-500" : "bg-mid-gray"}`} />
                <span className="capitalize">{s}</span>
                {event.status === s && <span className="ml-auto text-[10px]">Current</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
          <h2 className="font-display text-heading-4 font-semibold text-carbon-black mb-2">Danger Zone</h2>
          <p className="text-body-sm text-mid-gray mb-4">Permanently delete this event and all its data.</p>
          <button onClick={handleDelete} className="px-5 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">Delete Event</button>
        </div>
      </div>
    </div>
  );
}
