"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, UserPlus, X, Users, Mail, Check } from "lucide-react";

interface Participant {
  id: string;
  role_in_event: "buyer" | "seller";
  is_active: boolean;
  users: {
    id: string;
    name: string;
    company_name: string;
    email: string;
    logo_url: string | null;
    is_active: boolean;
    industries: { name: string } | null;
  };
}

interface AllUser {
  id: string;
  name: string;
  company_name: string;
  email: string;
  role: string;
  industries: { name: string } | null;
}

export default function ParticipantsPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addSearch, setAddSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<"all" | "buyer" | "seller">("all");

  // Bulk selection state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ added: number; reactivated: number; errors: { user_id: string; error: string }[] } | null>(null);

  const load = useCallback(async () => {
    const [partRes, usersRes] = await Promise.all([
      fetch(`/api/admin/events/${eventId}/participants`).then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
    ]);
    setParticipants(partRes.participants ?? []);
    setAllUsers(usersRes.users ?? []);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  const participantUserIds = new Set(participants.map((p) => p.users?.id));

  const filtered = participants.filter((p) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      p.users?.name?.toLowerCase().includes(s) ||
      p.users?.company_name?.toLowerCase().includes(s) ||
      p.users?.email?.toLowerCase().includes(s);
    const matchRole = roleFilter === "all" || p.role_in_event === roleFilter;
    return matchSearch && matchRole;
  });

  const addCandidates = allUsers.filter((u) => {
    if (participantUserIds.has(u.id)) return false;
    if (!["buyer", "seller"].includes(u.role)) return false;
    const s = addSearch.toLowerCase();
    return (
      !s ||
      u.name.toLowerCase().includes(s) ||
      u.company_name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s)
    );
  });

  const allSelected = addCandidates.length > 0 && addCandidates.every((u) => selected.has(u.id));
  const someSelected = addCandidates.some((u) => selected.has(u.id));

  function toggleUser(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        addCandidates.forEach((u) => next.delete(u.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        addCandidates.forEach((u) => next.add(u.id));
        return next;
      });
    }
  }

  async function handleBulkAdd(sendEmail: boolean) {
    const ids = [...selected].filter((id) => addCandidates.some((u) => u.id === id));
    if (!ids.length) return;
    setSubmitting(true);
    setBulkResult(null);

    const res = await fetch(`/api/admin/events/${eventId}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_ids: ids, send_email: sendEmail }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      alert(data.error ?? "Failed to add participants.");
      return;
    }

    setBulkResult(data);
    setSelected(new Set());
    await load();
  }

  async function removeParticipant(participantId: string) {
    if (!confirm("Remove this participant from the event?")) return;
    setRemoving(participantId);
    await fetch(`/api/admin/events/${eventId}/participants/${participantId}`, { method: "DELETE" });
    await load();
    setRemoving(null);
  }

  async function toggleActive(p: Participant) {
    await fetch(`/api/admin/events/${eventId}/participants/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !p.is_active }),
    });
    await load();
  }

  function closeModal() {
    setAddOpen(false);
    setAddSearch("");
    setSelected(new Set());
    setBulkResult(null);
  }

  const buyers = participants.filter((p) => p.role_in_event === "buyer" && p.is_active).length;
  const sellers = participants.filter((p) => p.role_in_event === "seller" && p.is_active).length;
  const selectedCount = [...selected].filter((id) => addCandidates.some((u) => u.id === id)).length;

  if (loading) return <div className="p-8 text-mid-gray text-sm">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-body-sm text-mid-gray mb-1">
            <Link href={`/admin/events/${eventId}`} className="hover:text-calm-blue">← Event</Link>
          </div>
          <h1 className="font-display text-heading-2 font-bold text-carbon-black">Participants</h1>
          <p className="text-body-sm text-mid-gray mt-1">
            {buyers} buyer{buyers !== 1 ? "s" : ""} · {sellers} seller{sellers !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/admin/events/${eventId}/export?type=participants`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-light-border text-ink-gray text-body-sm font-medium hover:border-calm-blue hover:text-calm-blue transition-colors"
          >
            Export Excel
          </a>
          <Link
            href={`/admin/events/${eventId}/assign`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-calm-blue text-calm-blue text-body-sm font-medium hover:bg-pale-blue-tint transition-colors"
          >
            AI Assign
          </Link>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-calm-blue text-white text-body-sm font-medium hover:bg-deep-blue transition-colors"
          >
            <UserPlus size={14} />
            Add Manually
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
          <input
            type="text"
            placeholder="Search participants…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-light-border rounded-xl text-body-sm bg-white focus:outline-none focus:ring-2 focus:ring-calm-blue"
          />
        </div>
        <div className="flex gap-1 bg-off-white border border-light-border rounded-xl p-1">
          {(["all", "buyer", "seller"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-lg text-body-sm font-medium transition-colors capitalize ${
                roleFilter === r ? "bg-white shadow-xs text-calm-blue" : "text-mid-gray hover:text-ink-gray"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Participants table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-mid-gray flex flex-col items-center gap-3">
          <Users size={36} strokeWidth={1.2} />
          <p className="text-body-md">No participants yet.</p>
          <p className="text-body-sm">Use AI Assign or add manually to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-light-border overflow-hidden shadow-sm">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="bg-pale-blue-tint border-b border-light-border">
                <th className="px-5 py-3 text-left text-label font-semibold text-mid-gray uppercase tracking-wide">Company</th>
                <th className="px-5 py-3 text-left text-label font-semibold text-mid-gray uppercase tracking-wide">Industry</th>
                <th className="px-5 py-3 text-left text-label font-semibold text-mid-gray uppercase tracking-wide">Role</th>
                <th className="px-5 py-3 text-left text-label font-semibold text-mid-gray uppercase tracking-wide">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-light-border last:border-0 hover:bg-off-white">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-ink-gray">{p.users?.company_name}</p>
                      <p className="text-mid-gray text-[12px]">{p.users?.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-mid-gray">{p.users?.industries?.name ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-label font-semibold uppercase tracking-wide ${
                      p.role_in_event === "buyer" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                    }`}>
                      {p.role_in_event}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`px-2.5 py-0.5 rounded-full text-label font-semibold cursor-pointer transition-colors ${
                        p.is_active
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-mid-gray/10 text-mid-gray hover:bg-mid-gray/20"
                      }`}
                    >
                      {p.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => removeParticipant(p.id)}
                      disabled={removing === p.id}
                      className="p-1.5 rounded-lg text-mid-gray hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add manually modal */}
      {addOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl flex flex-col max-h-[85vh]">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-light-border shrink-0">
                <div>
                  <h2 className="font-display font-semibold text-heading-4 text-ink-gray">Add Participants</h2>
                  {someSelected && (
                    <p className="text-[12px] text-calm-blue mt-0.5">{selectedCount} selected</p>
                  )}
                </div>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-off-white text-mid-gray">
                  <X size={16} />
                </button>
              </div>

              {/* Search */}
              <div className="px-6 py-3 border-b border-light-border shrink-0">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search by name, company, or email…"
                    value={addSearch}
                    onChange={(e) => setAddSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-light-border rounded-xl text-body-sm focus:outline-none focus:ring-2 focus:ring-calm-blue"
                  />
                </div>
              </div>

              {/* Bulk result banner */}
              {bulkResult && (
                <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100 shrink-0">
                  <p className="text-sm font-semibold text-emerald-700">
                    {bulkResult.added} added{bulkResult.reactivated > 0 ? `, ${bulkResult.reactivated} reactivated` : ""}
                    {bulkResult.errors.length > 0 ? ` · ${bulkResult.errors.length} failed` : ""}
                  </p>
                </div>
              )}

              {/* Select-all row */}
              {addCandidates.length > 0 && (
                <div
                  className="flex items-center gap-3 px-6 py-2.5 border-b border-light-border bg-off-white shrink-0 cursor-pointer"
                  onClick={toggleAll}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    allSelected ? "bg-calm-blue border-calm-blue" : someSelected ? "bg-calm-blue/30 border-calm-blue" : "border-light-border bg-white"
                  }`}>
                    {(allSelected || someSelected) && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-body-sm font-medium text-mid-gray">
                    {allSelected ? "Deselect all" : `Select all (${addCandidates.length})`}
                  </span>
                </div>
              )}

              {/* Candidate list */}
              <div className="flex-1 overflow-y-auto px-6 py-3">
                {addCandidates.length === 0 ? (
                  <p className="text-body-sm text-mid-gray text-center py-8">No eligible users found.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {addCandidates.map((u) => {
                      const isSelected = selected.has(u.id);
                      return (
                        <div
                          key={u.id}
                          onClick={() => toggleUser(u.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                            isSelected
                              ? "border-calm-blue bg-pale-blue-tint"
                              : "border-light-border hover:bg-off-white"
                          }`}
                        >
                          {/* Checkbox */}
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "bg-calm-blue border-calm-blue" : "border-light-border bg-white"
                          }`}>
                            {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                          </div>

                          {/* User info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-body-sm text-ink-gray truncate">{u.company_name}</p>
                            <p className="text-[12px] text-mid-gray truncate">
                              {u.email} · <span className={u.role === "buyer" ? "text-blue-600" : "text-purple-600"}>{u.role}</span>
                              {u.industries?.name ? ` · ${u.industries.name}` : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sticky footer with bulk actions */}
              <div className="px-6 py-4 border-t border-light-border shrink-0">
                {selectedCount > 0 ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAdd(false)}
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-calm-blue text-white text-body-sm font-semibold hover:bg-deep-blue disabled:opacity-50 transition-colors"
                    >
                      {submitting ? (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                      ) : (
                        <UserPlus size={14} />
                      )}
                      Add {selectedCount} participant{selectedCount !== 1 ? "s" : ""}
                    </button>
                    <button
                      onClick={() => handleBulkAdd(true)}
                      disabled={submitting}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-calm-blue text-calm-blue text-body-sm font-semibold hover:bg-pale-blue-tint disabled:opacity-50 transition-colors"
                      title="Add and send event notification emails"
                    >
                      <Mail size={14} />
                      + Email
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-body-sm text-mid-gray">Select users above to add them</p>
                )}
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
