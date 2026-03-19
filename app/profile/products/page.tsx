"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UserNav from "@/components/user/UserNav";
import { createClient } from "@/lib/supabase/client";
import { Package, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  thumbnail_url?: string | null;
}

interface FormState {
  name: string;
  description: string;
  thumbnail_url: string;
}

const emptyForm: FormState = { name: "", description: "", thumbnail_url: "" };

export default function ProductsLibraryPage() {
  const supabase = createClient();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<"buyer" | "seller">("buyer");
  const [products, setProducts] = useState<Product[]>([]);
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
          if (data) {
            setUserName(data.name);
            setUserRole(data.role as "buyer" | "seller");
          }
        });
    });
    fetchProducts();
  }, []);

  function fetchProducts() {
    fetch("/api/user/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .finally(() => setLoading(false));
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description ?? "", thumbnail_url: p.thumbnail_url ?? "" });
    setShowForm(false);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Product name is required."); return; }
    setSaving(true);
    setError("");
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/user/products/${editingId}` : "/api/user/products";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      fetchProducts();
      cancelForm();
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to save.");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/user/products/${id}`, { method: "DELETE" });
    setProducts((p) => p.filter((x) => x.id !== id));
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
            <h1 className="font-display font-bold text-[24px] text-[#0D0D0D]">My Products</h1>
            <p className="text-[14px] text-[#8A8A8A] mt-0.5">Your global product library. Select products per event when needed.</p>
          </div>
          {!showForm && !editingId && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-[13px] font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)", boxShadow: "0 4px 12px rgba(6,182,212,0.25)" }}
            >
              <Plus size={15} />
              Add Product
            </button>
          )}
        </div>

        {/* Add / Edit form */}
        {(showForm || editingId) && (
          <div className="mb-6 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.90)", border: "1px solid rgba(6,182,212,0.18)", boxShadow: "0 4px 20px rgba(6,182,212,0.10)" }}>
            <h2 className="font-display font-semibold text-[16px] text-[#0D0D0D] mb-4">
              {editingId ? "Edit Product" : "New Product"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#4B5563] mb-1.5">Name <span className="text-[#06B6D4]">*</span></label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Product name" className={inputClass} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#4B5563] mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} placeholder="Brief description…" className={`${inputClass} h-auto resize-none`} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#4B5563] mb-1.5">Product Image <span className="text-[#9CA3AF] font-normal">(optional)</span></label>
                <ImageUpload
                  bucket="product-images"
                  value={form.thumbnail_url}
                  onChange={(url) => setForm((p) => ({ ...p, thumbnail_url: url }))}
                  label="Upload Image"
                  previewClass="h-16"
                />
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

        {/* Product list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "rgba(216,230,245,0.5)" }} />
            ))}
          </div>
        ) : products.length === 0 && !showForm ? (
          <div className="rounded-2xl p-12 flex flex-col items-center gap-4 text-center"
            style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(6,182,212,0.12)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #EBF9FC 0%, #E0F7FA 100%)" }}>
              <Package size={28} strokeWidth={1.4} className="text-[#06B6D4]" />
            </div>
            <div>
              <p className="font-semibold text-[15px] text-[#0D0D0D] mb-1">No products yet</p>
              <p className="text-[13px] text-[#8A8A8A]">Add products to showcase them during events.</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="mt-1 px-5 py-2 rounded-xl text-white text-[13px] font-semibold"
              style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)" }}>
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(6,182,212,0.12)", boxShadow: "0 2px 8px rgba(6,182,212,0.06)" }}>
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} alt={p.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" style={{ border: "1px solid rgba(6,182,212,0.12)" }} />
                ) : (
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #EBF9FC 0%, #E0F7FA 100%)", border: "1px solid rgba(6,182,212,0.15)" }}>
                    <Package size={22} className="text-[#06B6D4]" strokeWidth={1.4} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] text-[#0D0D0D]">{p.name}</p>
                  {p.description && (
                    <p className="text-[12px] text-[#8A8A8A] mt-0.5 line-clamp-1">{p.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => startEdit(p)}
                    className="p-2 rounded-lg text-[#8A8A8A] hover:text-[#06B6D4] hover:bg-[#ECFEFF] transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(p.id)}
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
