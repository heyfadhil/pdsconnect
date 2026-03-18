"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import Link from "next/link";

type FormState = {
  name: string;
  description: string;
  venue_name: string;
  venue_address: string;
  event_start_date: string;
  event_end_date: string;
  matchup_open_date: string;
  matchup_close_date: string;
  max_matches_per_buyer: string;
  max_matches_per_procurer: string;
};

const initial: FormState = {
  name: "", description: "", venue_name: "", venue_address: "",
  event_start_date: "", event_end_date: "",
  matchup_open_date: "", matchup_close_date: "",
  max_matches_per_buyer: "", max_matches_per_procurer: "",
};

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent, status: "draft" | "live") => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        status,
        max_matches_per_buyer: form.max_matches_per_buyer ? parseInt(form.max_matches_per_buyer) : null,
        max_matches_per_procurer: form.max_matches_per_procurer ? parseInt(form.max_matches_per_procurer) : null,
      }),
    });

    if (res.ok) {
      const { event } = await res.json();
      router.push(`/admin/events/${event.id}`);
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to create event.");
      setSaving(false);
    }
  };

  const inputClass = "w-full h-11 px-4 rounded-lg border-[1.5px] border-light-border bg-white text-ink-gray placeholder:text-mid-gray text-sm focus:outline-none focus:border-calm-blue focus:shadow-[0_0_0_3px_rgba(46,127,217,0.15)] transition-all duration-fast";
  const labelClass = "block text-[13px] font-semibold text-carbon-black mb-1.5";

  return (
    <div className="p-8 max-w-3xl">
      <PageHeader
        title="New Event"
        description="Fill in the details to create a new matching event."
        action={<Link href="/admin/events" className="text-sm text-mid-gray hover:text-ink-gray transition-colors">← Back to Events</Link>}
      />

      <form onSubmit={(e) => handleSubmit(e, "draft")} className="space-y-8">
        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-light-border p-6 shadow-sm space-y-5">
          <h2 className="font-display text-heading-4 font-semibold text-carbon-black">Event Details</h2>

          <div>
            <label className={labelClass}>Event Name <span className="text-calm-blue">*</span></label>
            <input required value={form.name} onChange={set("name")} placeholder="e.g. PDS Tech Connect 2026" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={set("description")} rows={3} placeholder="What is this event about?" className={`${inputClass} h-auto py-3 resize-none`} />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Venue Name</label>
              <input value={form.venue_name} onChange={set("venue_name")} placeholder="e.g. KLCC Convention Centre" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Venue Address</label>
              <input value={form.venue_address} onChange={set("venue_address")} placeholder="Full address" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-2xl border border-light-border p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-display text-heading-4 font-semibold text-carbon-black">Event Dates</h2>
            <p className="text-body-sm text-mid-gray mt-0.5">Physical in-person days of the event.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Start Date</label>
              <input type="date" value={form.event_start_date} onChange={set("event_start_date")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input type="date" value={form.event_end_date} onChange={set("event_end_date")} className={inputClass} />
            </div>
          </div>

          <div className="pt-4 border-t border-light-border">
            <h2 className="font-display text-heading-4 font-semibold text-carbon-black mb-0.5">Matchup Window</h2>
            <p className="text-body-sm text-mid-gray mb-4">When users can browse and request matches online.</p>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Window Opens</label>
                <input type="date" value={form.matchup_open_date} onChange={set("matchup_open_date")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Window Closes</label>
                <input type="date" value={form.matchup_close_date} onChange={set("matchup_close_date")} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Match caps */}
        <div className="bg-white rounded-2xl border border-light-border p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-display text-heading-4 font-semibold text-carbon-black">Match Caps</h2>
            <p className="text-body-sm text-mid-gray mt-0.5">Leave blank for no limit.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Max Matches per Buyer</label>
              <input type="number" min="1" value={form.max_matches_per_buyer} onChange={set("max_matches_per_buyer")} placeholder="No limit" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Matches per Procurer</label>
              <input type="number" min="1" value={form.max_matches_per_procurer} onChange={set("max_matches_per_procurer")} placeholder="No limit" className={inputClass} />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-pale-blue-tint text-calm-blue text-sm font-semibold border border-light-border hover:bg-light-border transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save as Draft"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={(e) => handleSubmit(e as unknown as React.FormEvent, "live")}
            className="px-6 py-2.5 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors disabled:opacity-50"
          >
            Publish Live
          </button>
        </div>
      </form>
    </div>
  );
}
