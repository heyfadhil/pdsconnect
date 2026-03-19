"use client";

import { useEffect, useState } from "react";
import { X, Globe, Building2, Tag, Package, BookOpen, ExternalLink, Loader2 } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  company_name: string;
  bio?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  website_url?: string | null;
  tags?: string | null;
  industries?: { name: string } | null;
  already_requested?: boolean;
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

interface Props {
  profile: Profile | null;
  eventId: string;
  onClose: () => void;
  /** If provided, shows the Request Match button */
  onRequestMatch?: (id: string) => void;
  matchCapReached?: boolean;
  requesting?: boolean;
}

export default function ProfileModal({
  profile,
  eventId,
  onClose,
  onRequestMatch,
  matchCapReached,
  requesting,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [showcaseLoading, setShowcaseLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setShowcaseLoading(true);
    fetch(`/api/events/${eventId}/showcase/${profile.id}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products ?? []);
        setCatalogues(d.catalogues ?? []);
      })
      .catch(() => {})
      .finally(() => setShowcaseLoading(false));
  }, [profile?.id, eventId]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!profile) return null;

  const tags = (profile.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const hasShowcase = products.length > 0 || catalogues.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto relative w-full max-h-[90vh] overflow-hidden flex flex-col"
          style={{
            maxWidth: "min(70vw, 960px)",
            minWidth: "320px",
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(24px) saturate(1.4)",
            borderRadius: "20px",
            border: "1px solid rgba(6,182,212,0.18)",
            boxShadow: "0 24px 80px rgba(6,182,212,0.18), 0 4px 24px rgba(0,0,0,0.12)",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-[#8A8A8A] hover:bg-[#ECFEFF] hover:text-[#06B6D4] transition-colors"
          >
            <X size={18} />
          </button>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid lg:grid-cols-[320px_1fr]">

              {/* ── Left column: Profile info ── */}
              <div className="flex flex-col gap-5 border-b lg:border-b-0 lg:border-r" style={{ borderColor: "rgba(6,182,212,0.12)" }}>
                {/* Banner + Logo */}
                <div className="relative">
                  {/* Banner */}
                  <div className="h-[100px] w-full overflow-hidden rounded-tl-[20px] rounded-tr-[20px] lg:rounded-tr-none">
                    {profile.banner_url ? (
                      <img src={profile.banner_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{ background: "linear-gradient(135deg,#2E7FD9,#06B6D4,#14B8A6)" }} />
                    )}
                    <div className="absolute inset-x-0 top-0 h-[100px]" style={{ background: "linear-gradient(180deg,transparent 40%,rgba(0,0,0,.35) 100%)" }} />
                  </div>
                  {/* Logo overlapping banner */}
                  <div className="absolute left-6 -bottom-8">
                    {profile.logo_url ? (
                      <img
                        src={profile.logo_url}
                        alt={profile.company_name}
                        className="w-16 h-16 rounded-xl object-contain"
                        style={{ border: "3px solid white", background: "#F8FAFE", boxShadow: "0 2px 12px rgba(0,0,0,.15)" }}
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-display font-bold text-xl"
                        style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)", border: "3px solid white", boxShadow: "0 2px 12px rgba(0,0,0,.15)" }}
                      >
                        {profile.company_name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Name + Industry (with top margin to clear logo overlap) */}
                <div className="px-8 pt-10 flex flex-col gap-1">
                  <h2 className="font-display font-bold text-[20px] text-[#0D0D0D] leading-tight">
                    {profile.company_name}
                  </h2>
                  {profile.industries?.name && (
                    <span
                      className="inline-block mt-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full uppercase tracking-wide w-fit"
                      style={{ background: "#ECFEFF", color: "#06B6D4" }}
                    >
                      {profile.industries.name}
                    </span>
                  )}
                </div>

                <div className="px-8 pb-8 flex flex-col gap-5 flex-1">

                {/* Website */}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[13px] text-[#06B6D4] hover:text-[#0D9488] transition-colors"
                  >
                    <Globe size={13} />
                    {profile.website_url.replace(/^https?:\/\//, "")}
                    <ExternalLink size={11} />
                  </a>
                )}

                {/* Industry detail */}
                {profile.industries?.name && (
                  <div className="flex items-center gap-2 text-[13px] text-[#8A8A8A]">
                    <Building2 size={13} />
                    {profile.industries.name}
                  </div>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider">
                      <Tag size={11} />
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-0.5 text-[12px] text-[#0D0D0D] rounded-full"
                          style={{ background: "#F3F4F6", border: "1px solid #E5E7EB" }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {profile.bio && (
                  <div>
                    <p className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider mb-2">About</p>
                    <p className="text-[13px] text-[#4B5563] leading-relaxed whitespace-pre-line">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Request Match action (buyer only) */}
                {onRequestMatch && (
                  <div className="pt-2">
                    {profile.already_requested ? (
                      <button disabled className="w-full py-3 rounded-xl text-[14px] font-semibold cursor-not-allowed"
                        style={{ background: "#F3F4F6", color: "#9CA3AF" }}>
                        Already Requested
                      </button>
                    ) : matchCapReached ? (
                      <button disabled className="w-full py-3 rounded-xl text-[14px] font-semibold cursor-not-allowed"
                        style={{ background: "#F3F4F6", color: "#9CA3AF" }}>
                        Match Limit Reached
                      </button>
                    ) : (
                      <button
                        onClick={() => onRequestMatch(profile.id)}
                        disabled={requesting}
                        className="w-full py-3 rounded-xl text-[14px] font-semibold text-white disabled:opacity-60 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                        style={{
                          background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 50%, #14B8A6 100%)",
                          boxShadow: "0 4px 16px rgba(6,182,212,0.30)",
                        }}
                      >
                        {requesting ? "Requesting…" : "Request Match"}
                      </button>
                    )}
                  </div>
                )}
                </div>{/* end px-8 pb-8 */}
              </div>{/* end left column */}

              {/* ── Right column: Products + Catalogues ── */}
              <div className="p-8 flex flex-col gap-6">
                {showcaseLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-[#06B6D4]" />
                  </div>
                ) : !hasShowcase ? (
                  <div className="flex flex-col items-center justify-center py-12 text-[#8A8A8A] gap-3">
                    <Package size={32} strokeWidth={1.2} />
                    <p className="text-[14px]">No products or catalogues shared for this event.</p>
                  </div>
                ) : (
                  <>
                    {/* Products */}
                    {products.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Package size={15} className="text-[#06B6D4]" />
                          <h3 className="font-display font-semibold text-[15px] text-[#0D0D0D]">
                            Products <span className="text-[#8A8A8A] font-normal text-[13px]">({products.length})</span>
                          </h3>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {products.map((p) => (
                            <ProductCard key={p.id} product={p} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Catalogues */}
                    {catalogues.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <BookOpen size={15} className="text-[#06B6D4]" />
                          <h3 className="font-display font-semibold text-[15px] text-[#0D0D0D]">
                            Catalogues <span className="text-[#8A8A8A] font-normal text-[13px]">({catalogues.length})</span>
                          </h3>
                        </div>
                        <div className="flex flex-col gap-2">
                          {catalogues.map((c) => (
                            <CatalogueRow key={c.id} catalogue={c} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div
      className="rounded-xl p-3 flex gap-3 items-start"
      style={{ background: "#F8FAFE", border: "1px solid rgba(6,182,212,0.12)" }}
    >
      {product.thumbnail_url ? (
        <img
          src={product.thumbnail_url}
          alt={product.name}
          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
          style={{ border: "1px solid rgba(6,182,212,0.12)" }}
        />
      ) : (
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #EBF9FC 0%, #E0F7FA 100%)", border: "1px solid rgba(6,182,212,0.15)" }}
        >
          <Package size={20} className="text-[#06B6D4]" strokeWidth={1.4} />
        </div>
      )}
      <div className="min-w-0">
        <p className="font-semibold text-[13px] text-[#0D0D0D] leading-snug">{product.name}</p>
        {product.description && (
          <p className="text-[12px] text-[#8A8A8A] mt-0.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>
    </div>
  );
}

function CatalogueRow({ catalogue }: { catalogue: Catalogue }) {
  return (
    <a
      href={catalogue.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:-translate-y-0.5 group"
      style={{
        background: "#F8FAFE",
        border: "1px solid rgba(6,182,212,0.12)",
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)" }}
      >
        <BookOpen size={15} className="text-white" />
      </div>
      <span className="flex-1 text-[13px] font-medium text-[#0D0D0D] truncate group-hover:text-[#06B6D4] transition-colors">
        {catalogue.name}
      </span>
      <ExternalLink size={13} className="text-[#8A8A8A] flex-shrink-0 group-hover:text-[#06B6D4] transition-colors" />
    </a>
  );
}
