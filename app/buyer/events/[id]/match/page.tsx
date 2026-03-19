"use client";

import { useEffect, useRef, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, ChevronLeft, FileText, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Counterpart {
  id: string;
  name: string;
  company_name: string;
  bio?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  tags?: string | null;
  industries?: { id: string; name: string } | null;
  already_requested: boolean;
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  thumbnail_url?: string | null;
}

interface Catalogue {
  id: string;
  name: string;
  file_url: string;
}

type Screen = "deck" | "overlay" | "product" | "celebration";

const GRADIENTS = [
  "linear-gradient(135deg,#2E7FD9,#06B6D4)",
  "linear-gradient(135deg,#14B8A6,#06B6D4)",
  "linear-gradient(135deg,#0D9488,#14B8A6)",
  "linear-gradient(135deg,#1A5FAA,#2E7FD9)",
  "linear-gradient(135deg,#5BABF0,#2E7FD9)",
];
function cardGrad(idx: number) { return GRADIENTS[idx % GRADIENTS.length]; }
function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BuyerMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (window.innerWidth > 768) router.replace(`/buyer/events/${eventId}/discover`);
  }, [eventId, router]);

  const [counterparts, setCounterparts] = useState<Counterpart[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("PDS Event");
  const [idx, setIdx] = useState(0);
  const [screen, setScreen] = useState<Screen>("deck");
  const [requesting, setRequesting] = useState(false);
  const [matchedName, setMatchedName] = useState("");
  const [matchedGrad, setMatchedGrad] = useState("");
  const [matchedInitials, setMatchedInitials] = useState("");
  const [overlayProducts, setOverlayProducts] = useState<Product[]>([]);
  const [overlayCatalogues, setOverlayCatalogues] = useState<Catalogue[]>([]);
  const [overlayLoading, setOverlayLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // ── DOM refs for zero-React-render drag ──
  const cardRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const dragRef = useRef({
    startX: 0, startY: 0, dx: 0, dy: 0,
    dragging: false,
    tapTimer: null as ReturnType<typeof setTimeout> | null,
  });

  // Current card snapshot captured at pointer-down, so triggerMatch uses the right card
  const currentRef = useRef<Counterpart | null>(null);
  const idxRef = useRef(0);

  useEffect(() => {
    fetch(`/api/events/${eventId}/discover`)
      .then((r) => r.json())
      .then((d) => {
        const all: Counterpart[] = d.all ?? d.counterparts ?? [];
        setCounterparts(all.filter((c) => !c.already_requested));
        setEventName(d.eventName ?? "PDS Event");
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  const counterpartsRef = useRef<Counterpart[]>([]);
  useEffect(() => { counterpartsRef.current = counterparts; }, [counterparts]);
  useEffect(() => { idxRef.current = idx; }, [idx]);

  const clampedIdx = Math.min(idx, Math.max(counterparts.length - 1, 0));
  const current = counterparts[clampedIdx];
  const next1 = counterparts[clampedIdx + 1];
  const next2 = counterparts[clampedIdx + 2];

  // ── Direct DOM helpers — no React re-render ──
  function applyTransform(t: string, transition = "none") {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = transition;
    card.style.transform = t;
  }

  function springBack() {
    applyTransform("none", "transform 0.42s cubic-bezier(0.34,1.56,0.64,1)");
    if (indicatorRef.current) indicatorRef.current.style.opacity = "0";
  }

  function flingOut(dx: number, callback: () => void) {
    const xOut = dx > 0 ? 700 : -700;
    const rot = dx > 0 ? 18 : -18;
    applyTransform(`translateX(${xOut}px) rotate(${rot}deg)`, "transform 0.26s ease-in");
    setTimeout(callback, 260);
  }

  function flingDown(callback: () => void) {
    applyTransform("translateY(900px)", "transform 0.22s ease-in");
    setTimeout(callback, 220);
  }

  // ── Pointer handlers ──
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (screen !== "deck") return;
    const d = dragRef.current;
    d.startX = e.clientX;
    d.startY = e.clientY;
    d.dx = 0; d.dy = 0; d.dragging = true;
    // Snapshot current card for this gesture
    const c = counterpartsRef.current;
    const i = Math.min(idxRef.current, Math.max(c.length - 1, 0));
    currentRef.current = c[i] ?? null;
    cardRef.current?.setPointerCapture(e.pointerId);
    // Reset transition so drag is instant
    if (cardRef.current) cardRef.current.style.transition = "none";
    d.tapTimer = setTimeout(() => { d.tapTimer = null; }, 200);
  }, [screen]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const d = dragRef.current;
    d.dx = e.clientX - d.startX;
    d.dy = e.clientY - d.startY;
    // Use RAF to avoid doing DOM writes faster than frame rate
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const card = cardRef.current;
      if (!card) return;
      card.style.transform = `translate(${d.dx}px,${d.dy}px) rotate(${d.dx * 0.035}deg)`;
      const ind = indicatorRef.current;
      if (ind) {
        const show = d.dy > 30 && d.dy > Math.abs(d.dx);
        ind.style.opacity = show ? String(Math.min((d.dy - 30) / 60, 1)) : "0";
      }
    });
  }, []);

  const onPointerUp = useCallback(() => {
    const d = dragRef.current;
    if (!d.dragging) return;
    d.dragging = false;
    cancelAnimationFrame(rafRef.current);
    if (indicatorRef.current) indicatorRef.current.style.opacity = "0";

    const wasTap = d.tapTimer !== null && Math.abs(d.dx) < 8 && Math.abs(d.dy) < 8;
    if (d.tapTimer) { clearTimeout(d.tapTimer); d.tapTimer = null; }

    const { dx, dy } = d;

    if (wasTap || dy < -10) {
      springBack();
      openOverlay();
      return;
    }
    if (dy > 90 && Math.abs(dy) > Math.abs(dx)) {
      flingDown(() => { applyTransform("none", "none"); doMatch(); });
      return;
    }
    if (Math.abs(dx) > 80) {
      // Left/right = navigate prev/next (not dismiss)
      if (dx < 0) {
        // Swipe left → next
        flingOut(dx, () => {
          applyTransform("none", "none");
          setIdx((i) => Math.min(i + 1, counterpartsRef.current.length - 1));
        });
      } else {
        // Swipe right → previous
        flingOut(dx, () => {
          applyTransform("none", "none");
          setIdx((i) => Math.max(0, i - 1));
        });
      }
      return;
    }
    springBack();
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  async function doMatch() {
    const snap = currentRef.current;
    if (!snap || requesting) return;
    setRequesting(true);
    const grad = cardGrad(idxRef.current);
    const ini = initials(snap.company_name);
    setMatchedName(snap.company_name);
    setMatchedGrad(grad);
    setMatchedInitials(ini);
    // Remove matched card from deck so it doesn't appear again
    setCounterparts((prev) => prev.filter((c) => c.id !== snap.id));
    setScreen("celebration");
    if ("vibrate" in navigator) navigator.vibrate([10, 50, 20]);
    const res = await fetch(`/api/events/${eventId}/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seller_id: snap.id }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Match request failed:", err);
    }
    setRequesting(false);
  }

  async function openOverlay() {
    const snap = currentRef.current ?? current;
    if (!snap) return;
    setScreen("overlay");
    setOverlayLoading(true);
    setOverlayProducts([]);
    setOverlayCatalogues([]);
    try {
      const res = await fetch(`/api/events/${eventId}/showcase/${snap.id}`);
      const d = await res.json();
      setOverlayProducts(d.products ?? []);
      setOverlayCatalogues(d.catalogues ?? []);
    } finally {
      setOverlayLoading(false);
    }
    if ("vibrate" in navigator) navigator.vibrate([20]);
  }

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center"
        style={{ background: "radial-gradient(ellipse at 20% 30%,rgba(6,182,212,.22) 0%,transparent 55%),radial-gradient(ellipse at 80% 70%,rgba(46,127,217,.20) 0%,transparent 55%),#06101E" }}>
        <Loader2 size={32} className="animate-spin text-[#06B6D4]" />
      </div>
    );
  }

  const hasCards = counterparts.length > 0;

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 20% 30%,rgba(6,182,212,.22) 0%,transparent 55%),radial-gradient(ellipse at 80% 70%,rgba(46,127,217,.20) 0%,transparent 55%),radial-gradient(ellipse at 50% 90%,rgba(20,184,166,.14) 0%,transparent 55%),#06101E",
        fontFamily: "'Inter',sans-serif",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-12 pb-0 relative z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-[0.06em]"
          style={{ background: "rgba(0,212,255,.10)", borderColor: "rgba(0,212,255,.22)", color: "#00D4FF" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#14B8A6", boxShadow: "0 0 6px #14B8A6" }} />
          {eventName.toUpperCase().substring(0, 20)}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold"
          style={{ background: "rgba(20,184,166,.12)", borderColor: "rgba(20,184,166,.25)", color: "#14B8A6" }}>
          🛒 BUYER MODE
        </div>
      </div>

      {/* Deck header */}
      <div className="px-6 pt-4 pb-2 relative z-10">
        <h1 className="text-[22px] font-black text-white" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>
          Seller Matches
        </h1>
        <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,.45)" }}>
          {hasCards ? `${counterparts.length} seller${counterparts.length !== 1 ? "s" : ""} available` : "No more sellers to browse"}
        </p>
      </div>

      {/* Card stack */}
      <div className="flex-1 relative flex items-center justify-center px-5 z-10">

        {/* Down-swipe indicator — opacity controlled via ref, no state */}
        <div
          ref={indicatorRef}
          className="absolute bottom-[110px] left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-[13px] font-black border backdrop-blur-sm pointer-events-none z-20 whitespace-nowrap"
          style={{
            opacity: 0,
            color: "#00D4FF",
            borderColor: "#00D4FF",
            background: "rgba(0,212,255,.12)",
            boxShadow: "0 0 20px rgba(0,212,255,.30)",
          }}
        >
          ↓ MATCH
        </div>

        {!hasCards ? (
          <div className="flex flex-col items-center gap-4 text-center px-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <ZapIcon size={28} style={{ color: "#06B6D4" }} strokeWidth={1.5} />
            </div>
            <p className="text-white font-semibold text-[17px]">You&apos;ve browsed everyone!</p>
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,.45)" }}>Check back when new sellers are added.</p>
          </div>
        ) : (
          <>
            {next2 && <MatchCard s={next2} grad={cardGrad(idx + 2)} layer="back" />}
            {next1 && <MatchCard s={next1} grad={cardGrad(idx + 1)} layer="mid" />}
            {current && (
              <div
                ref={cardRef}
                className="absolute w-full rounded-[28px] overflow-hidden cursor-grab active:cursor-grabbing"
                style={{
                  touchAction: "none",
                  willChange: "transform",
                  zIndex: 3,
                  background: "rgba(255,255,255,.06)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,.10)",
                  boxShadow: "0 8px 40px rgba(0,0,0,.4)",
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <CardContent s={current} grad={cardGrad(idx)} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-7 pt-3 relative z-10">
        <button
          onClick={() => { if (hasCards && !requesting) { currentRef.current = current; doMatch(); } }}
          disabled={!hasCards || requesting}
          className="w-full flex items-center justify-center gap-2 rounded-[18px] text-white font-black text-[15px] tracking-[0.02em] disabled:opacity-40 active:scale-[.98] transition-transform"
          style={{ padding: "18px", background: "linear-gradient(135deg,#2E7FD9 0%,#06B6D4 55%,#14B8A6 100%)", boxShadow: "0 6px 28px rgba(6,182,212,.45)" }}
        >
          {requesting ? <Loader2 size={18} className="animate-spin" /> : "↓  Swipe Down to Match"}
        </button>
      </div>

      {/* ══ OVERLAY (Screen 2) ══ */}
      <div className="absolute inset-0 z-[50]" style={{ pointerEvents: screen === "overlay" ? "all" : "none" }}>
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", opacity: screen === "overlay" ? 1 : 0 }}
          onClick={() => setScreen("deck")}
        />
        <div
          className="absolute bottom-0 left-0 right-0 flex flex-col overflow-hidden"
          style={{
            height: "82%",
            background: "#0E1E35",
            borderRadius: "28px 28px 0 0",
            border: "1px solid rgba(0,212,255,.12)",
            borderBottom: "none",
            boxShadow: "0 -8px 40px rgba(0,0,0,.5)",
            transform: screen === "overlay" ? "translateY(0)" : "translateY(100%)",
            transition: "transform 0.38s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <div className="w-9 h-1 rounded-full mx-auto mt-2.5 flex-shrink-0" style={{ background: "rgba(255,255,255,.15)" }} />
          {current && (
            <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
              <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-white font-black text-[14px] flex-shrink-0"
                style={{ background: cardGrad(idx) }}>
                {initials(current.company_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-[16px]" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>{current.company_name}</p>
                <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,.4)" }}>{current.industries?.name ?? ""}</p>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-5 pb-6" style={{ WebkitOverflowScrolling: "touch" }}>
            {overlayLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin" style={{ color: "#06B6D4" }} />
              </div>
            ) : (
              <>
                {overlayProducts.length > 0 && (
                  <>
                    <p className="text-[10px] font-bold tracking-[.12em] uppercase mt-4 mb-2.5" style={{ color: "rgba(255,255,255,.30)" }}>Products &amp; Solutions</p>
                    <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-5 px-5" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
                      {overlayProducts.map((p, pi) => (
                        <button key={p.id} onClick={() => { setSelectedProduct(p); setScreen("product"); }}
                          className="flex-shrink-0 w-[140px] rounded-2xl overflow-hidden text-left active:scale-95 transition-transform"
                          style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
                          <div className="h-[90px] flex items-center justify-center relative" style={{ background: GRADIENTS[pi % GRADIENTS.length] }}>
                            {p.thumbnail_url ? (
                              <img src={p.thumbnail_url} alt={p.name} className="w-full h-full object-cover absolute inset-0" />
                            ) : <span className="text-[28px] relative z-10">📦</span>}
                          </div>
                          <div className="p-2.5">
                            <p className="text-white text-[12px] font-bold leading-tight mb-1">{p.name}</p>
                            <p className="text-[10px]" style={{ color: "rgba(255,255,255,.35)" }}>{p.description?.substring(0, 30) ?? "View product"}</p>
                            <div className="flex gap-1 mt-2">
                              <span className="flex-1 text-center py-1 rounded text-[9px] font-bold" style={{ background: "rgba(6,182,212,.12)", color: "#00D4FF", border: "1px solid rgba(0,212,255,.18)" }}>View</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {overlayCatalogues.length > 0 && (
                  <>
                    <p className="text-[10px] font-bold tracking-[.12em] uppercase mt-5 mb-2.5" style={{ color: "rgba(255,255,255,.30)" }}>Catalogues &amp; Documents</p>
                    <div className="flex flex-col gap-2">
                      {overlayCatalogues.map((c) => (
                        <a key={c.id} href={c.file_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl active:scale-[.98] transition-transform"
                          style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)" }}>
                          <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#2E7FD9,#06B6D4)" }}>
                            <FileText size={16} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-[13px] font-semibold truncate">{c.name}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,.35)" }}>PDF · tap to open</p>
                          </div>
                          <ExternalLink size={14} style={{ color: "rgba(255,255,255,.25)" }} />
                        </a>
                      ))}
                    </div>
                  </>
                )}
                {overlayProducts.length === 0 && overlayCatalogues.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <p className="text-[14px] font-semibold" style={{ color: "rgba(255,255,255,.5)" }}>No products showcased yet</p>
                    <p className="text-[12px]" style={{ color: "rgba(255,255,255,.3)" }}>This seller hasn&apos;t selected products for this event.</p>
                  </div>
                )}
                {current?.bio && (
                  <>
                    <p className="text-[10px] font-bold tracking-[.12em] uppercase mt-5 mb-2.5" style={{ color: "rgba(255,255,255,.30)" }}>About</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,.65)" }}>{current.bio}</p>
                  </>
                )}
                <button
                  onClick={() => { currentRef.current = current; doMatch(); }}
                  disabled={requesting}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl text-white font-black text-[15px] mt-6 disabled:opacity-50 active:scale-[.97] transition-transform"
                  style={{ padding: "16px", background: "linear-gradient(135deg,#2E7FD9,#06B6D4,#14B8A6)", boxShadow: "0 4px 24px rgba(6,182,212,.45)" }}
                >
                  {requesting ? <Loader2 size={16} className="animate-spin" /> : `↓ Match with ${current?.company_name ?? "Seller"}`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ══ PRODUCT DETAIL (Screen 3) ══ */}
      <div
        className="absolute inset-0 z-[60] flex flex-col"
        style={{
          background: "#0A1628",
          transform: screen === "product" ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {selectedProduct && (
          <>
            <div className="h-[220px] relative overflow-hidden flex-shrink-0">
              {selectedProduct.thumbnail_url ? (
                <img src={selectedProduct.thumbnail_url} alt={selectedProduct.name} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0" style={{ background: cardGrad(idx) }} />
              )}
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,.2) 0%,rgba(10,22,40,.8) 100%)" }} />
              <button onClick={() => setScreen("overlay")}
                className="absolute top-12 left-4 w-9 h-9 rounded-[10px] flex items-center justify-center z-10"
                style={{ background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.15)" }}>
                <ChevronLeft size={18} className="text-white" />
              </button>
              <div className="absolute bottom-5 left-5 z-10 text-[48px]">📦</div>
              <div className="absolute bottom-5 right-5 z-10 px-3 py-1.5 rounded-full text-[10px] font-bold"
                style={{ background: "rgba(0,0,0,.5)", backdropFilter: "blur(8px)", color: "#00D4FF", border: "1px solid rgba(0,212,255,.25)" }}>
                Product
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5" style={{ WebkitOverflowScrolling: "touch" }}>
              <p className="text-[11px] font-semibold uppercase tracking-[.06em] mb-1.5" style={{ color: "rgba(255,255,255,.4)" }}>{current?.company_name}</p>
              <h2 className="text-[24px] font-black text-white mb-2 leading-tight" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>{selectedProduct.name}</h2>
              <p className="text-[13px] leading-relaxed mb-5" style={{ color: "rgba(255,255,255,.55)" }}>{selectedProduct.description ?? "No description available."}</p>
              <button
                onClick={() => { currentRef.current = current; doMatch(); setScreen("deck"); }}
                disabled={requesting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl text-white font-black text-[15px] mt-2 disabled:opacity-50 active:scale-[.97] transition-transform"
                style={{ padding: "16px", background: "linear-gradient(135deg,#2E7FD9,#06B6D4,#14B8A6)", boxShadow: "0 4px 24px rgba(6,182,212,.40)" }}
              >
                {requesting ? <Loader2 size={16} className="animate-spin" /> : "Request Match with Seller"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ══ CELEBRATION (Screen 4) ══ */}
      <div
        className="absolute inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: "#030810",
          opacity: screen === "celebration" ? 1 : 0,
          pointerEvents: screen === "celebration" ? "all" : "none",
          transition: "opacity 0.3s ease",
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%,rgba(0,212,255,.18) 0%,transparent 65%)" }} />
        {screen === "celebration" && <Confetti />}

        <div className="relative z-10 flex items-center gap-0 mb-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center text-white font-black text-[22px]"
              style={{ background: "linear-gradient(135deg,#1A5FAA,#2E7FD9)", boxShadow: "0 8px 32px rgba(6,182,212,.40)" }}>Me</div>
            <p className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,.5)" }}>You</p>
          </div>
          <div className="flex flex-col items-center px-3">
            <div className="h-0.5 w-12 rounded-full" style={{ background: "linear-gradient(135deg,#2E7FD9,#06B6D4)", boxShadow: "0 0 8px rgba(0,212,255,.6)" }} />
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] -mt-3"
              style={{ background: "linear-gradient(135deg,#2E7FD9,#06B6D4)", boxShadow: "0 0 16px rgba(0,212,255,.5)" }}>⚡</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center text-white font-black text-[22px]"
              style={{ background: matchedGrad, boxShadow: "0 8px 32px rgba(6,182,212,.40)" }}>{matchedInitials}</div>
            <p className="text-[11px] font-semibold text-center max-w-[80px]" style={{ color: "rgba(255,255,255,.5)" }}>{matchedName.split(" ").slice(0, 2).join(" ")}</p>
          </div>
        </div>

        <div className="relative z-10 text-center mb-3">
          <p className="text-[14px] font-semibold uppercase tracking-[.10em] mb-1" style={{ color: "rgba(255,255,255,.45)" }}>It&apos;s</p>
          <p className="font-black text-[40px] leading-none" style={{ fontFamily: "'Sora','Inter',sans-serif", background: "linear-gradient(135deg,#2E7FD9,#06B6D4,#14B8A6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            A Match!
          </p>
        </div>
        <p className="text-[14px] mb-10 relative z-10 text-center px-8" style={{ color: "rgba(255,255,255,.45)" }}>
          You and {matchedName} are now matched!
        </p>

        <div className="flex flex-col gap-2.5 w-[85%] relative z-10">
          <button
            onClick={() => { setScreen("deck"); router.push(`/buyer/events/${eventId}/matches`); }}
            className="w-full py-4 rounded-2xl text-white font-black text-[15px] active:scale-[.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#2E7FD9,#06B6D4,#14B8A6)", boxShadow: "0 4px 24px rgba(6,182,212,.45)" }}
          >
            ⚡ View Matches
          </button>
          <button
            onClick={() => setScreen("deck")}
            className="w-full py-3.5 rounded-2xl text-[14px] font-semibold active:scale-[.97] transition-transform"
            style={{ background: "transparent", color: "rgba(255,255,255,.55)", border: "1.5px solid rgba(255,255,255,.12)" }}
          >
            Keep Browsing →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MatchCard({ s, grad, layer }: { s: Counterpart; grad: string; layer: "mid" | "back" }) {
  return (
    <div
      className="absolute w-full rounded-[28px] overflow-hidden"
      style={{
        transform: layer === "mid" ? "scale(.94) translateY(14px)" : "scale(.88) translateY(28px)",
        transition: "transform .3s ease",
        zIndex: layer === "mid" ? 2 : 1,
        background: "rgba(255,255,255,.06)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,.10)",
      }}
    >
      <CardContent s={s} grad={grad} />
    </div>
  );
}

function CardContent({ s, grad }: { s: Counterpart; grad: string }) {
  const tags = (s.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  return (
    <>
      <div className="h-[160px] relative overflow-hidden">
        {s.banner_url ? (
          <>
            <img src={s.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,.45) 100%)" }} />
          </>
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: grad, opacity: .85 }} />
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 80% 20%,rgba(255,255,255,.12),transparent 60%)" }} />
          </>
        )}
        {s.logo_url ? (
          <img src={s.logo_url} alt={s.company_name} className="absolute bottom-4 left-5 w-14 h-14 rounded-2xl object-cover" style={{ border: "2.5px solid rgba(255,255,255,.30)" }} />
        ) : (
          <div className="absolute bottom-4 left-5 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-[18px]"
            style={{ background: grad, border: "2.5px solid rgba(255,255,255,.30)", boxShadow: "0 4px 16px rgba(0,0,0,.3)" }}>
            {initials(s.company_name)}
          </div>
        )}
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-[12px] font-black"
          style={{ background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,212,255,.35)", color: "#00D4FF", letterSpacing: ".04em" }}>
          {s.industries?.name ?? "Business"}
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[.06em] mb-2" style={{ color: "rgba(255,255,255,.45)" }}>Seller</p>
        <p className="text-[20px] font-black text-white mb-1" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>{s.company_name}</p>
        <p className="text-[12px] mb-3.5" style={{ color: "rgba(255,255,255,.45)" }}>{s.bio?.substring(0, 60) ?? ""}…</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map((t, i) => (
              <span key={t} className="px-2 py-1 rounded text-[10px] font-bold"
                style={{ background: i === 0 ? "rgba(6,182,212,.15)" : "rgba(20,184,166,.12)", color: i === 0 ? "#00D4FF" : "#14B8A6", border: `1px solid ${i === 0 ? "rgba(0,212,255,.20)" : "rgba(20,184,166,.20)"}` }}>
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="text-center py-1.5 text-[11px]" style={{ color: "rgba(255,255,255,.30)", borderTop: "1px solid rgba(255,255,255,.08)" }}>
          ↑ tap to see products &amp; catalogue
        </div>
      </div>
    </>
  );
}

function Confetti() {
  const COLORS = ["#00D4FF", "#06B6D4", "#14B8A6", "#5BABF0", "#ffffff"];
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    size: (i % 3) * 3 + 4,
    left: (i * 3.33) % 100,
    top: (i * 7) % 30 + 5,
    delay: (i * 0.027),
    dur: (i % 3) * 0.6 + 1.6,
    circle: i % 2 === 0,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`@keyframes confetti-fall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(900px) rotate(720deg);opacity:0}}`}</style>
      {particles.map((p) => (
        <div key={p.id} style={{
          position: "absolute", width: p.size, height: p.size, background: p.color,
          left: `${p.left}%`, top: `${p.top}%`,
          borderRadius: p.circle ? "50%" : "3px",
          animation: `confetti-fall ${p.dur}s ease-in ${p.delay}s forwards`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

function ZapIcon({ size, style, strokeWidth }: { size: number; style?: React.CSSProperties; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
