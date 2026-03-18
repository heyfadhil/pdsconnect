"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import { X, UserPlus } from "lucide-react";

type User = {
  id: string; name: string; email: string; company_name: string;
  role: string; is_active: boolean; welcome_sent: boolean;
  industry_id: string | null; tags: string | null;
  industries?: { name: string } | null;
};

type Industry = { id: string; name: string };

const roleColors: Record<string, string> = {
  buyer: "bg-pale-blue-tint text-calm-blue",
  seller: "bg-deep-blue/10 text-deep-blue",
  admin: "bg-yellow-50 text-yellow-700",
  staff: "bg-gray-100 text-mid-gray",
  superadmin: "bg-red-50 text-red-600",
};

const inputClass = "w-full h-10 px-3 rounded-lg border-[1.5px] border-light-border bg-white text-ink-gray text-sm focus:outline-none focus:border-calm-blue focus:shadow-[0_0_0_3px_rgba(46,127,217,0.15)] transition-all";
const labelClass = "block text-[12px] font-semibold text-mid-gray uppercase tracking-wide mb-1";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Add user modal state
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", company_name: "",
    role: "buyer", industry_id: "", tags: "",
  });
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState("");
  const [sendWelcome, setSendWelcome] = useState(false);

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    fetch("/api/admin/industries").then((r) => r.json()).then((d) => setIndustries(d.industries ?? []));
  }, []);

  const openAdd = () => {
    setForm({ name: "", email: "", password: "", company_name: "", role: "buyer", industry_id: "", tags: "" });
    setAddError("");
    setSendWelcome(false);
    setAddOpen(true);
  };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password || !form.company_name) {
      setAddError("All fields except industry and tags are required.");
      return;
    }
    setSaving(true);
    setAddError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        company_name: form.company_name,
        role: form.role,
        industry_id: form.industry_id || null,
        tags: form.tags || null,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setAddError(json.error ?? "Failed to create user.");
      setSaving(false);
      return;
    }
    // Optionally send welcome email
    if (sendWelcome && json.user?.id) {
      await fetch(`/api/admin/users/${json.user.id}/welcome`, { method: "POST" });
    }
    setSaving(false);
    setAddOpen(false);
    fetchUsers();
  };

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="p-8">
      <PageHeader
        title="User Database"
        description="All registered Buyers, Sellers, and staff accounts."
        action={
          <div className="flex gap-3">
            <Link href="/admin/users/upload" className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-light-border text-sm font-semibold text-ink-gray hover:border-calm-blue hover:text-calm-blue transition-all shadow-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><polyline points="9 15 12 12 15 15" /></svg>
              Excel Upload
            </Link>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors shadow-sm"
            >
              <UserPlus size={15} />
              Add User
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm h-10 px-4 rounded-lg border-[1.5px] border-light-border bg-white text-ink-gray placeholder:text-mid-gray text-sm focus:outline-none focus:border-calm-blue transition-all"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border-[1.5px] border-light-border bg-white text-sm text-ink-gray focus:outline-none focus:border-calm-blue transition-all"
        >
          <option value="">All roles</option>
          <option value="buyer">Buyers</option>
          <option value="seller">Sellers</option>
          <option value="admin">Admins</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-light-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-mid-gray text-sm">Loading...</div>
        ) : !users.length ? (
          <div className="p-12 text-center">
            <p className="text-carbon-black font-semibold mb-1">No users found</p>
            <p className="text-mid-gray text-sm mb-4">Try adjusting your search, or add a user manually.</p>
            <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors">
              <UserPlus size={14} /> Add User
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-light-border">
              <p className="text-body-sm text-mid-gray">{users.length} user{users.length !== 1 ? "s" : ""}</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-light-border">
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-mid-gray uppercase tracking-[0.08em]">Name / Company</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-mid-gray uppercase tracking-[0.08em]">Email</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-mid-gray uppercase tracking-[0.08em]">Role</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-mid-gray uppercase tracking-[0.08em]">Status</th>
                  <th className="px-6 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-off-white transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-carbon-black">{u.name}</p>
                      <p className="text-[12px] text-mid-gray mt-0.5">{u.company_name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-gray">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${roleColors[u.role] ?? "bg-gray-100 text-mid-gray"}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${u.is_active ? "bg-green-500" : "bg-mid-gray"}`} />
                        <span className="text-[12px] text-ink-gray">{u.is_active ? "Active" : "Inactive"}</span>
                        {!u.welcome_sent && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">No welcome</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/users/${u.id}`} className="text-xs font-semibold text-calm-blue hover:text-deep-blue transition-colors">Edit →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Add User Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-light-border">
              <h2 className="font-display text-heading-4 font-bold text-carbon-black">Add New User</h2>
              <button onClick={() => setAddOpen(false)} className="text-mid-gray hover:text-carbon-black transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input value={form.name} onChange={set("name")} placeholder="Jane Doe" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input type="email" value={form.email} onChange={set("email")} placeholder="jane@company.com" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Company Name *</label>
                <input value={form.company_name} onChange={set("company_name")} placeholder="Acme Sdn Bhd" className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Role *</label>
                  <select value={form.role} onChange={set("role")} className={inputClass}>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Industry</label>
                  <select value={form.industry_id} onChange={set("industry_id")} className={inputClass}>
                    <option value="">— None —</option>
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.id}>{ind.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Tags</label>
                <input value={form.tags} onChange={set("tags")} placeholder="e.g. SME, F&B, Halal (comma-separated)" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Password *</label>
                <input type="password" value={form.password} onChange={set("password")} placeholder="Minimum 8 characters" className={inputClass} />
                <p className="text-[11px] text-mid-gray mt-1">The user can change this after logging in.</p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendWelcome}
                  onChange={(e) => setSendWelcome(e.target.checked)}
                  className="w-4 h-4 rounded border-light-border text-calm-blue focus:ring-calm-blue"
                />
                <span className="text-sm text-ink-gray">Send welcome email with login instructions</span>
              </label>

              {addError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{addError}</div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-light-border flex justify-end gap-3">
              <button onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-lg border border-light-border text-sm font-semibold text-ink-gray hover:bg-off-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors disabled:opacity-50"
              >
                {saving ? "Creating…" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
