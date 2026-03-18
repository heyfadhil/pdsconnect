"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import UserNav from "@/components/user/UserNav";
import { createClient } from "@/lib/supabase/client";
import { Package, Check } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  thumbnail_url?: string | null;
}

interface Props {
  params: Promise<{ eventId: string }>;
}

export default function EventProductSelectionPage({ params }: Props) {
  const { eventId } = use(params);
  const supabase = createClient();

  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<"buyer" | "seller">("seller");
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("users").select("name, role").eq("id", user.id).single()
        .then(({ data }) => {
          if (data) { setUserName(data.name); setUserRole(data.role as "buyer" | "seller"); }
        });
    });

    // Load products library + current selection in parallel
    Promise.all([
      fetch("/api/user/products").then((r) => r.json()),
      fetch(`/api/events/${eventId}/my-products`).then((r) => r.json()),
      // Fetch event name
      fetch("/api/user/events").then((r) => r.json()),
    ]).then(([lib, sel, evts]) => {
      setProducts(lib.products ?? []);
      setSelected(new Set(sel.selected ?? []));
      const ev = (evts.events ?? []).find((e: { id: string; name: string }) => e.id === eventId);
      if (ev) setEventName(ev.name);
    }).finally(() => setLoading(false));
  }, [eventId]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/events/${eventId}/my-products`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_ids: Array.from(selected) }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(145deg, #EEF5FC 0%, #F5F8FC 60%, #EBF2FA 100%)" }}>
      <UserNav userName={userName} userRole={userRole} />
      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <Link href="/profile/products" className="text-[12px] text-[#8A8A8A] hover:text-[#06B6D4] transition-colors mb-1 block">← Back to Product Library</Link>
          <h1 className="font-display font-bold text-[22px] text-[#0D0D0D]">Select Products for Event</h1>
          {eventName && <p className="text-[14px] text-[#8A8A8A] mt-0.5">{eventName}</p>}
          <p className="text-[13px] text-[#8A8A8A] mt-1">Choose which products to showcase on your profile during this event.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "rgba(216,230,245,0.5)" }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl p-12 flex flex-col items-center gap-4 text-center"
            style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(6,182,212,0.12)" }}>
            <Package size={32} strokeWidth={1.2} className="text-[#8A8A8A]" />
            <p className="text-[14px] text-[#8A8A8A]">No products in your library yet.</p>
            <Link href="/profile/products"
              className="px-4 py-2 rounded-xl text-white text-[13px] font-semibold"
              style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)" }}>
              Add Products
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-6">
              {products.map((p) => {
                const isSelected = selected.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all"
                    style={{
                      background: isSelected ? "rgba(236,254,255,0.95)" : "rgba(255,255,255,0.85)",
                      border: isSelected ? "1.5px solid #06B6D4" : "1.5px solid rgba(6,182,212,0.12)",
                      boxShadow: isSelected ? "0 2px 12px rgba(6,182,212,0.15)" : "0 2px 8px rgba(6,182,212,0.05)",
                    }}
                  >
                    {p.thumbnail_url ? (
                      <img src={p.thumbnail_url} alt={p.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        style={{ border: "1px solid rgba(6,182,212,0.12)" }} />
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
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: isSelected ? "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)" : "#F3F4F6",
                        border: isSelected ? "none" : "1.5px solid #D1D5DB",
                      }}>
                      {isSelected && <Check size={13} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2.5 rounded-xl text-white text-[13px] font-semibold disabled:opacity-60 transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)", boxShadow: "0 4px 12px rgba(6,182,212,0.25)" }}>
                {saving ? "Saving…" : `Save Selection (${selected.size})`}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#059669]">
                  <Check size={14} />
                  Saved!
                </span>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
