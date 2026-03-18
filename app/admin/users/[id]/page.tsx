"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";

type UserProfile = {
  id: string; name: string; email: string; company_name: string;
  role: string; website_url: string | null; industry_id: string | null;
  tags: string | null; bio: string | null; logo_url: string | null;
  is_active: boolean; welcome_sent: boolean;
};
type Industry = { id: string; name: string };

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/users/${id}`).then((r) => r.json()),
      fetch("/api/admin/industries").then((r) => r.json()),
    ]).then(([userData, indData]) => {
      setUser(userData.user);
      setForm(userData.user);
      setIndustries(indData.industries ?? []);
      setLoading(false);
    });
  }, [id]);

  const set = (field: keyof UserProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value || null }));

  const handleSave = async () => {
    setSaving(true); setMsg(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const { user: u } = await res.json();
      setUser(u); setMsg({ type: "success", text: "Changes saved." });
    } else {
      const d = await res.json();
      setMsg({ type: "error", text: d.error ?? "Failed to save." });
    }
    setSaving(false);
  };

  const handleSendWelcome = async () => {
    setSending(true); setMsg(null);
    const res = await fetch(`/api/admin/users/${id}/welcome`, { method: "POST" });
    const d = await res.json();
    setMsg({ type: res.ok ? "success" : "error", text: res.ok ? "Welcome email sent." : d.error });
    if (res.ok) setUser((u) => u ? { ...u, welcome_sent: true, is_active: true } : u);
    setSending(false);
  };

  const handleResetPassword = async () => {
    setResetting(true); setMsg(null);
    const res = await fetch(`/api/admin/users/${id}/reset-password`, { method: "POST" });
    const d = await res.json();
    setMsg({ type: res.ok ? "success" : "error", text: res.ok ? "Password reset email sent." : d.error });
    setResetting(false);
  };

  const inputClass = "w-full h-10 px-3 rounded-lg border-[1.5px] border-light-border bg-white text-ink-gray text-sm focus:outline-none focus:border-calm-blue focus:shadow-[0_0_0_3px_rgba(46,127,217,0.15)] transition-all";
  const labelClass = "block text-[12px] font-semibold text-mid-gray uppercase tracking-wide mb-1";

  if (loading) return <div className="p-8 text-mid-gray text-sm">Loading...</div>;
  if (!user) return <div className="p-8 text-mid-gray text-sm">User not found.</div>;

  return (
    <div className="p-8 max-w-3xl">
      <PageHeader
        title={user.name}
        description={`${user.company_name} · ${user.email}`}
        action={<Link href="/admin/users" className="text-sm text-mid-gray hover:text-ink-gray transition-colors">← Back to Users</Link>}
      />

      {msg && (
        <div className={`text-sm px-4 py-3 rounded-lg border mb-6 ${msg.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}>
          {msg.text}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-light-border p-6 shadow-sm space-y-4">
            <h2 className="font-display text-heading-4 font-semibold text-carbon-black">Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Full Name</label><input value={form.name ?? ""} onChange={set("name")} className={inputClass} /></div>
              <div><label className={labelClass}>Company</label><input value={form.company_name ?? ""} onChange={set("company_name")} className={inputClass} /></div>
              <div><label className={labelClass}>Email</label><input type="email" value={form.email ?? ""} onChange={set("email")} className={inputClass} /></div>
              <div><label className={labelClass}>Website URL</label><input type="url" value={form.website_url ?? ""} onChange={set("website_url")} placeholder="https://" className={inputClass} /></div>
            </div>
            <div>
              <label className={labelClass}>Bio</label>
              <textarea value={form.bio ?? ""} onChange={set("bio")} rows={4} className={`${inputClass} h-auto py-2.5 resize-none`} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-light-border p-6 shadow-sm space-y-4">
            <h2 className="font-display text-heading-4 font-semibold text-carbon-black">Admin-Managed Fields</h2>
            <div>
              <label className={labelClass}>Industry</label>
              <select value={form.industry_id ?? ""} onChange={set("industry_id")} className={inputClass}>
                <option value="">— None —</option>
                {industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tags <span className="normal-case font-normal text-mid-gray">(comma-separated)</span></label>
              <input value={form.tags ?? ""} onChange={set("tags")} placeholder="SME, Export-ready, Local" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <select value={form.role ?? ""} onChange={set("role")} className={inputClass}>
                <option value="buyer">Buyer</option>
                <option value="procurer">Procurer</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Sidebar actions */}
        <div className="space-y-5">
          {/* Account status */}
          <div className="bg-white rounded-2xl border border-light-border p-5 shadow-sm">
            <h3 className="font-semibold text-carbon-black text-sm mb-4">Account Status</h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-mid-gray">Active</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${user.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-mid-gray"}`}>{user.is_active ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-mid-gray">Welcome Sent</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${user.welcome_sent ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>{user.welcome_sent ? "Yes" : "Pending"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <button onClick={handleSendWelcome} disabled={sending} className="w-full py-2 rounded-lg bg-calm-blue text-white text-xs font-semibold hover:bg-deep-blue transition-colors disabled:opacity-50">
                {sending ? "Sending..." : user.welcome_sent ? "Re-send Welcome Email" : "Send Welcome Email"}
              </button>
              <button onClick={handleResetPassword} disabled={resetting} className="w-full py-2 rounded-lg border border-light-border text-xs font-semibold text-ink-gray hover:border-calm-blue hover:text-calm-blue transition-all disabled:opacity-50">
                {resetting ? "Sending..." : "Send Password Reset"}
              </button>
            </div>
          </div>

          {/* Toggle active */}
          <div className="bg-white rounded-2xl border border-light-border p-5 shadow-sm">
            <h3 className="font-semibold text-carbon-black text-sm mb-3">Deactivate Account</h3>
            <p className="text-[12px] text-mid-gray mb-3">Deactivated users cannot log in.</p>
            <button
              onClick={async () => {
                const newState = !user.is_active;
                await fetch(`/api/admin/users/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: newState }) });
                setUser((u) => u ? { ...u, is_active: newState } : u);
              }}
              className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${user.is_active ? "border border-red-200 text-red-600 hover:bg-red-50" : "border border-green-200 text-green-700 hover:bg-green-50"}`}
            >
              {user.is_active ? "Deactivate User" : "Activate User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
