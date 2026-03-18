"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UserNav from "@/components/user/UserNav";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Plus, Pencil, Trash2, X, Check, ExternalLink } from "lucide-react";

interface Catalogue {
  id: string;
  name: string;
  file_url: string;
}

interface FormState { name: string; file_url: string; }
const emptyForm: FormState = { name: "", file_url: "" };

export default function CataloguesLibraryPage() {
  const supabase = createClient();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<"buyer" | "seller">("seller");
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("users").select("name, role").eq("id", user.id).single()
        .then(({ data }) => {
          if (data) { setUserName(data.name); setUserRole(data.role as "buyer" | "seller"); }
        });
    });
    fetchCatalogues();
  }, []);

  function fetchCatalogues() {
    fetch("/api/user/catalogues")
      .then((r) => r.json())
      .then((d) => setCatalogues(d.catalogues ?? []))
      .finally(() => setLoading(false));
  }

  function startEdit(c: Catalogue) {
    setEditingId(c.id);
    setForm({ name: c.name, file_url: c.file_url });
    setShowForm(false);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!form.file_url.trim()) { setError("File URL is required."); return; }
    setSaving(true);
    setError("");
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/user/catalogues/${editingId}` : "/api/user/catalogues";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      fetchCatalogues();
      cancelForm();
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to save.");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this catalogue?")) return;
    await fetch(`/api/user/catalogues/${id}`, { method: "DELETE" });
    setCatalogues((c) => c.filter((x) => x.id !== id));
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[#D1D5DB] bg-white text-[13px] text-[#0D0D0D] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#06B6D4] focus:shadow-[0_0_0_3px_rgba(6,182,212,0.12)] transition-all";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(145deg, #EEF5FC 0%, #F5F8FC 60%, #EBF2FA 100%)" }}>
      <UserNav userName={userName} userRole={userRole} />
      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/profile" className="text-[12px] text-[#8A8A8A] hover:text-[#06B6D4] transition-colors mb-1 block">← Back to Profile</Link>
            <h1 className="font-display font-bold text-[24px] text-[#0D0D0D]">My Catalogues</h1>
            <p className="text-[14px] text-[#8A8A8A] mt-0.5">Your PDF catalogue library. Select catalogues per event when needed.</p>
          </div>
          {!showForm && !editingId && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-[13px] font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)", boxShadow: "0 4px 12px rgba(6,182,212,0.25)" }}>
              <Plus size={15} />
              Add Catalogue
            </button>
          )}
        </div>

        {/* Form */}
        {(showForm || editingId) && (
          <div className="mb-6 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.90)", border: "1px solid rgba(6,182,212,0.18)", boxShadow: "0 4px 20px rgba(6,182,212,0.10)" }}>
            <h2 className="font-display font-semibold text-[16px] text-[#0D0D0D] mb-4">
              {editingId ? "Edit Catalogue" : "New Catalogue"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#4B5563] mb-1.5">Name <span className="text-[#06B6D4]">*</span></label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. 2026 Product Catalogue" className={inputClass} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#4B5563] mb-1.5">PDF / File URL <span className="text-[#06B6D4]">*</span></label>
                <input value={form.file_url} onChange={(e) => setForm((p) => ({ ...p, file_url: e.target.value }))} placeholder="https://… (Google Drive, Dropbox, etc.)" className={inputClass} />
              </div>
              {error && <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-semibold disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)" }}>
                  <Check size={14} />
                  {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={cancelForm} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors">
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Catalogue list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "rgba(216,230,245,0.5)" }} />
            ))}
          </div>
        ) : catalogues.length === 0 && !showForm ? (
          <div className="rounded-2xl p-12 flex flex-col items-center gap-4 text-center"
            style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(6,182,212,0.12)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #EBF9FC 0%, #E0F7FA 100%)" }}>
              <BookOpen size={28} strokeWidth={1.4} className="text-[#06B6D4]" />
            </div>
            <div>
              <p className="font-semibold text-[15px] text-[#0D0D0D] mb-1">No catalogues yet</p>
              <p className="text-[13px] text-[#8A8A8A]">Add PDFs or file links to share during events.</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="mt-1 px-5 py-2 rounded-xl text-white text-[13px] font-semibold"
              style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)" }}>
              Add Your First Catalogue
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {catalogues.map((c) => (
              <div key={c.id} className="rounded-2xl px-5 py-4 flex items-center gap-4"
                style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(6,182,212,0.12)", boxShadow: "0 2px 8px rgba(6,182,212,0.06)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)" }}>
                  <BookOpen size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] text-[#0D0D0D]">{c.name}</p>
                  <a href={c.file_url} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-[#06B6D4] hover:text-[#0D9488] flex items-center gap-1 mt-0.5 truncate max-w-xs"
                    onClick={(e) => e.stopPropagation()}>
                    <ExternalLink size={10} />
                    {c.file_url.replace(/^https?:\/\//, "").substring(0, 50)}…
                  </a>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => startEdit(c)}
                    className="p-2 rounded-lg text-[#8A8A8A] hover:text-[#06B6D4] hover:bg-[#ECFEFF] transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="p-2 rounded-lg text-[#8A8A8A] hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
