"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";

type Settings = {
  negotiation_reminder_hours: number | null;
  negotiation_auto_cancel_hours: number | null;
  default_max_matches_buyer: number | null;
  default_max_matches_seller: number | null;
  default_matchup_window_days: number | null;
  admin_notification_emails: string | null;
};

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState<Settings>({
    negotiation_reminder_hours: 24,
    negotiation_auto_cancel_hours: 48,
    default_max_matches_buyer: 5,
    default_max_matches_seller: 5,
    default_matchup_window_days: 30,
    admin_notification_emails: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(({ settings: s, error: err }) => {
        if (err) { setError(err); setLoading(false); return; }
        setSettings(s);
        setForm({
          negotiation_reminder_hours: s.negotiation_reminder_hours ?? 24,
          negotiation_auto_cancel_hours: s.negotiation_auto_cancel_hours ?? 48,
          default_max_matches_buyer: s.default_max_matches_buyer ?? 5,
          default_max_matches_seller: s.default_max_matches_seller ?? 5,
          default_matchup_window_days: s.default_matchup_window_days ?? 30,
          admin_notification_emails: s.admin_notification_emails ?? "",
        });
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);
    if (res.status === 403) { setForbidden(true); return; }
    if (json.error) { setError(json.error); return; }
    setSettings(json.settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const field = (key: keyof Settings, label: string, hint: string, type: "number" | "text" = "number") => (
    <div>
      <label className="block text-sm font-semibold text-carbon-black mb-1">{label}</label>
      <p className="text-[12px] text-mid-gray mb-2">{hint}</p>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={form[key] ?? ""}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            [key]: type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value,
          }))
        }
        className="border border-light-border rounded-lg px-4 py-2.5 text-sm text-carbon-black focus:outline-none focus:ring-2 focus:ring-calm-blue/30 w-full max-w-xs"
      />
    </div>
  );

  return (
    <div className="p-8 max-w-2xl">
      <PageHeader
        title="System Settings"
        description="Platform-wide configuration. Superadmin only."
      />

      {loading ? (
        <div className="text-mid-gray py-10">Loading…</div>
      ) : forbidden ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
          You need superadmin permissions to edit system settings.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-light-border shadow-sm p-8 space-y-8">

          {/* Negotiation Timings */}
          <div>
            <h2 className="font-display text-heading-4 font-semibold text-carbon-black mb-5">Negotiation Timings</h2>
            <div className="space-y-5">
              {field(
                "negotiation_reminder_hours",
                "Reminder threshold (hours)",
                "Send a reminder email to the awaiting party after this many hours of inactivity. Default: 24."
              )}
              {field(
                "negotiation_auto_cancel_hours",
                "Auto-cancel threshold (hours)",
                "Automatically cancel a negotiation that has been pending for this many hours. Default: 48."
              )}
            </div>
          </div>

          <hr className="border-light-border" />

          {/* Match Caps */}
          <div>
            <h2 className="font-display text-heading-4 font-semibold text-carbon-black mb-5">Default Match Caps</h2>
            <p className="text-[13px] text-mid-gray mb-5">
              These are defaults applied when creating new events. Event-level settings override these.
            </p>
            <div className="space-y-5">
              {field(
                "default_max_matches_buyer",
                "Max matches per buyer",
                "Maximum number of match requests a buyer can send per event. Default: 5."
              )}
              {field(
                "default_max_matches_seller",
                "Max matches per seller",
                "Maximum number of matches a seller can receive per event. Default: 5."
              )}
              {field(
                "default_matchup_window_days",
                "Default matchup window (days)",
                "Default duration of the matchup window when creating a new event. Default: 30."
              )}
            </div>
          </div>

          <hr className="border-light-border" />

          {/* Admin Notifications */}
          <div>
            <h2 className="font-display text-heading-4 font-semibold text-carbon-black mb-5">Admin Notifications</h2>
            {field(
              "admin_notification_emails",
              "Notification emails",
              "Comma-separated list of email addresses to receive admin alerts (e.g. stalled negotiations).",
              "text"
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Settings"}
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-semibold">Settings saved ✓</span>
            )}
          </div>

          {settings && (
            <p className="text-[11px] text-mid-gray">
              Last updated: {settings ? new Date((settings as unknown as { updated_at?: string }).updated_at ?? "").toLocaleString("en-GB") : "—"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
