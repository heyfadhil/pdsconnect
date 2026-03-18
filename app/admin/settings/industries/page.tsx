"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";

type Industry = { id: string; name: string; created_at: string };

export default function IndustriesPage() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  const fetchIndustries = async () => {
    const res = await fetch("/api/admin/industries");
    const data = await res.json();
    setIndustries(data.industries ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchIndustries(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError("");
    const res = await fetch("/api/admin/industries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName("");
      fetchIndustries();
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to add industry.");
    }
    setAdding(false);
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    setError("");
    const res = await fetch(`/api/admin/industries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    if (res.ok) {
      setEditId(null);
      fetchIndustries();
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to update.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete industry "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/industries/${id}`, { method: "DELETE" });
    if (res.ok) fetchIndustries();
  };

  return (
    <div className="p-8 max-w-2xl">
      <PageHeader
        title="Industries"
        description="Manage the global master list of industries used across all user profiles."
      />

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-3 mb-8">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New industry name (e.g. Aerospace)"
          className="flex-1 h-11 px-4 rounded-lg border-[1.5px] border-light-border bg-white text-ink-gray placeholder:text-mid-gray focus:outline-none focus:border-calm-blue focus:shadow-[0_0_0_3px_rgba(46,127,217,0.15)] transition-all duration-fast text-sm"
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="flex items-center gap-2 px-5 h-11 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add Industry"}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
          {error}
        </p>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-light-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-mid-gray text-sm">Loading...</div>
        ) : !industries.length ? (
          <div className="p-8 text-center text-mid-gray text-sm">No industries yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-light-border">
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-mid-gray uppercase tracking-[0.08em]">Name</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-mid-gray uppercase tracking-[0.08em]">Added</th>
                <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-mid-gray uppercase tracking-[0.08em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border">
              {industries.map((ind) => (
                <tr key={ind.id} className="hover:bg-off-white transition-colors">
                  <td className="px-6 py-4">
                    {editId === ind.id ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEdit(ind.id);
                          if (e.key === "Escape") setEditId(null);
                        }}
                        className="h-9 px-3 rounded-lg border-[1.5px] border-calm-blue bg-white text-ink-gray text-sm focus:outline-none focus:shadow-[0_0_0_3px_rgba(46,127,217,0.15)] w-full max-w-xs"
                      />
                    ) : (
                      <span className="text-sm font-medium text-carbon-black">{ind.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-body-sm text-mid-gray">
                    {new Date(ind.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {editId === ind.id ? (
                        <>
                          <button onClick={() => handleEdit(ind.id)} className="text-xs font-semibold text-calm-blue hover:text-deep-blue transition-colors">Save</button>
                          <button onClick={() => setEditId(null)} className="text-xs font-semibold text-mid-gray hover:text-ink-gray transition-colors">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(ind.id); setEditName(ind.name); }} className="text-xs font-semibold text-calm-blue hover:text-deep-blue transition-colors">Edit</button>
                          <button onClick={() => handleDelete(ind.id, ind.name)} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
