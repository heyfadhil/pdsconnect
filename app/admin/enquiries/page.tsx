"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/admin/PageHeader";

type Enquiry = {
  id: string; full_name: string; company_name: string; email: string;
  phone: string | null; role_interest: string; message: string | null;
  status: string; created_at: string; user_id: string | null;
};

const statusFlow = ["new", "contacted", "account_created", "onboarded", "rejected"] as const;

const statusStyle: Record<string, string> = {
  new: "bg-sky-blue/10 text-calm-blue",
  contacted: "bg-yellow-50 text-yellow-700",
  account_created: "bg-blue-50 text-deep-blue",
  onboarded: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
};

const roleLabel: Record<string, string> = {
  buyer: "Buyer", seller: "Seller", unsure: "Not sure",
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [actioning, setActioning] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const fetchEnquiries = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/enquiries?${params}`);
    const data = await res.json();
    setEnquiries(data.enquiries ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  const updateStatus = async (id: string, status: string) => {
    setActioning(true);
    const res = await fetch(`/api/admin/enquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchEnquiries();
      setSelected((p) => p ? { ...p, status } : p);
    }
    setActioning(false);
  };

  const createAccount = async (enq: Enquiry) => {
    setActioning(true);
    setActionMsg("");
    const res = await fetch(`/api/admin/enquiries/${enq.id}/create-account`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setActionMsg("Account created (inactive). Send welcome email when ready.");
      fetchEnquiries();
      setSelected((p) => p ? { ...p, status: "account_created", user_id: data.user_id } : p);
    } else {
      setActionMsg(data.error ?? "Failed to create account.");
    }
    setActioning(false);
  };

  const sendWelcome = async (enq: Enquiry) => {
    if (!enq.user_id) return;
    setActioning(true);
    setActionMsg("");
    const res = await fetch(`/api/admin/users/${enq.user_id}/welcome`, { method: "POST" });
    if (res.ok) {
      setActionMsg("Welcome email sent. Account is now active.");
      await updateStatus(enq.id, "onboarded");
    } else {
      const d = await res.json();
      setActionMsg(d.error ?? "Failed to send welcome email.");
    }
    setActioning(false);
  };

  return (
    <div className="p-8">
      <PageHeader title="Enquiries" description="Interest form submissions from the landing page." />

      {/* Filter */}
      <div className="flex gap-3 mb-6">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-lg border-[1.5px] border-light-border bg-white text-sm text-ink-gray focus:outline-none focus:border-calm-blue transition-all">
          <option value="">All statuses</option>
          {statusFlow.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className={`bg-white rounded-2xl border border-light-border shadow-sm overflow-hidden ${selected ? "flex-1 min-w-0" : "w-full"}`}>
          {loading ? (
            <div className="p-8 text-center text-mid-gray text-sm">Loading...</div>
          ) : !enquiries.length ? (
            <div className="p-12 text-center text-mid-gray text-sm">No enquiries found.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-light-border">
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-mid-gray uppercase tracking-[0.08em]">Company / Name</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-mid-gray uppercase tracking-[0.08em]">Role</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-mid-gray uppercase tracking-[0.08em]">Status</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-mid-gray uppercase tracking-[0.08em]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {enquiries.map((enq) => (
                  <tr
                    key={enq.id}
                    onClick={() => { setSelected(enq); setActionMsg(""); }}
                    className={`cursor-pointer transition-colors ${selected?.id === enq.id ? "bg-pale-blue-tint" : "hover:bg-off-white"}`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-carbon-black">{enq.company_name}</p>
                      <p className="text-[12px] text-mid-gray mt-0.5">{enq.full_name}</p>
                    </td>
                    <td className="px-5 py-4 text-body-sm text-ink-gray capitalize">{roleLabel[enq.role_interest] ?? enq.role_interest}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle[enq.status] ?? "bg-gray-100 text-mid-gray"}`}>{enq.status.replace("_", " ")}</span>
                    </td>
                    <td className="px-5 py-4 text-body-sm text-mid-gray">
                      {new Date(enq.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-light-border shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-heading-4 font-semibold text-carbon-black">Enquiry Detail</h3>
                <button onClick={() => setSelected(null)} className="text-mid-gray hover:text-ink-gray transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: "Company", value: selected.company_name },
                  { label: "Name", value: selected.full_name },
                  { label: "Email", value: selected.email },
                  { label: "Phone", value: selected.phone ?? "—" },
                  { label: "Role", value: roleLabel[selected.role_interest] ?? selected.role_interest },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[11px] font-semibold text-mid-gray uppercase tracking-wide">{label}</p>
                    <p className="text-sm text-carbon-black mt-0.5">{value}</p>
                  </div>
                ))}
                {selected.message && (
                  <div>
                    <p className="text-[11px] font-semibold text-mid-gray uppercase tracking-wide">Message</p>
                    <p className="text-sm text-ink-gray mt-0.5 leading-relaxed">{selected.message}</p>
                  </div>
                )}
              </div>

              {/* Status update */}
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-mid-gray uppercase tracking-wide mb-2">Update Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {statusFlow.map((s) => (
                    <button
                      key={s}
                      disabled={selected.status === s || actioning}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize transition-all ${selected.status === s ? statusStyle[s] + " cursor-default" : "bg-gray-100 text-ink-gray hover:bg-pale-blue-tint hover:text-calm-blue disabled:opacity-40"}`}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                {selected.status === "contacted" && !selected.user_id && (
                  <button
                    onClick={() => createAccount(selected)}
                    disabled={actioning}
                    className="w-full py-2.5 rounded-lg bg-calm-blue text-white text-xs font-semibold hover:bg-deep-blue transition-colors disabled:opacity-50"
                  >
                    Create Account (Inactive)
                  </button>
                )}
                {selected.user_id && selected.status === "account_created" && (
                  <button
                    onClick={() => sendWelcome(selected)}
                    disabled={actioning}
                    className="w-full py-2.5 rounded-lg bg-calm-blue text-white text-xs font-semibold hover:bg-deep-blue transition-colors disabled:opacity-50"
                  >
                    Send Welcome Email
                  </button>
                )}
                <a
                  href={`mailto:${selected.email}`}
                  className="block w-full py-2.5 rounded-lg border border-light-border text-center text-xs font-semibold text-ink-gray hover:border-calm-blue hover:text-calm-blue transition-all"
                >
                  Send Email
                </a>
              </div>

              {actionMsg && (
                <p className="mt-4 text-[12px] text-calm-blue bg-pale-blue-tint border border-light-border rounded-lg px-3 py-2 leading-relaxed">{actionMsg}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
