"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";

type User = {
  id: string; name: string; email: string; company_name: string;
  role: string; is_active: boolean; welcome_sent: boolean;
  industry_id: string | null; tags: string | null;
  industries?: { name: string } | null;
};

const roleColors: Record<string, string> = {
  buyer: "bg-pale-blue-tint text-calm-blue",
  procurer: "bg-deep-blue/10 text-deep-blue",
  admin: "bg-yellow-50 text-yellow-700",
  staff: "bg-gray-100 text-mid-gray",
  superadmin: "bg-red-50 text-red-600",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

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

  const filtered = users;

  return (
    <div className="p-8">
      <PageHeader
        title="User Database"
        description="All registered Buyers, Procurers, and staff accounts."
        action={
          <div className="flex gap-3">
            <Link href="/admin/users/upload" className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-light-border text-sm font-semibold text-ink-gray hover:border-calm-blue hover:text-calm-blue transition-all shadow-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><polyline points="9 15 12 12 15 15" /></svg>
              Excel Upload
            </Link>
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
          <option value="procurer">Procurers</option>
          <option value="admin">Admins</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-light-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-mid-gray text-sm">Loading...</div>
        ) : !filtered.length ? (
          <div className="p-12 text-center">
            <p className="text-carbon-black font-semibold mb-1">No users found</p>
            <p className="text-mid-gray text-sm mb-4">Try adjusting your search or upload users via Excel.</p>
            <Link href="/admin/users/upload" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors">Upload Excel</Link>
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-light-border">
              <p className="text-body-sm text-mid-gray">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</p>
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
                {filtered.map((u) => (
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
    </div>
  );
}
