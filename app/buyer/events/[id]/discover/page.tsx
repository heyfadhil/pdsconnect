"use client";

import { useEffect, useState, use } from "react";
import ProfileDrawer from "@/components/user/ProfileDrawer";
import { Search, SlidersHorizontal, Building2, Tag, X } from "lucide-react";

interface Counterpart {
  id: string;
  name: string;
  company_name: string;
  bio?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  tags?: string | null;
  industry_id?: string | null;
  industries?: { id: string; name: string } | null;
  already_requested: boolean;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function BuyerDiscoverPage({ params }: Props) {
  const { id: eventId } = use(params);

  const [counterparts, setCounterparts] = useState<Counterpart[]>([]);
  const [allCounterparts, setAllCounterparts] = useState<Counterpart[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [drawerProfile, setDrawerProfile] = useState<Counterpart | null>(null);
  const [matchCapReached, setMatchCapReached] = useState(false);
  const [requesting, setRequesting] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}/discover`)
      .then((r) => r.json())
      .then((d) => {
        setCounterparts(d.counterparts ?? []);
        setAllCounterparts(d.all ?? []);
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  // All industries from visible list
  const industries = Array.from(
    new Map(
      allCounterparts
        .filter((c) => c.industries)
        .map((c) => [c.industries!.id, c.industries!.name])
    ).entries()
  ).map(([id, name]) => ({ id, name }));

  // All tags
  const allTags = Array.from(
    new Set(
      allCounterparts.flatMap((c) =>
        (c.tags ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      )
    )
  ).sort();

  // Apply client-side search / filters
  const filtered = counterparts.filter((c) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      c.company_name.toLowerCase().includes(s) ||
      (c.bio ?? "").toLowerCase().includes(s);
    const matchIndustry = !industryFilter || c.industry_id === industryFilter;
    const matchTag =
      !tagFilter ||
      (c.tags ?? "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .includes(tagFilter.toLowerCase());
    return matchSearch && matchIndustry && matchTag;
  });

  async function requestMatch(procurerId: string) {
    setRequesting(procurerId);
    const res = await fetch(`/api/events/${eventId}/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ procurer_id: procurerId }),
    });

    if (res.ok) {
      setCounterparts((prev) =>
        prev.map((c) =>
          c.id === procurerId ? { ...c, already_requested: true } : c
        )
      );
      setAllCounterparts((prev) =>
        prev.map((c) =>
          c.id === procurerId ? { ...c, already_requested: true } : c
        )
      );
      if (drawerProfile?.id === procurerId) {
        setDrawerProfile((p) => p && { ...p, already_requested: true });
      }
    } else {
      const d = await res.json();
      if (d.error?.includes("maximum match limit")) setMatchCapReached(true);
      alert(d.error ?? "Failed to send match request.");
    }
    setRequesting(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-mid-gray">
        Loading procurers…
      </div>
    );
  }

  const hasFilters = search || industryFilter || tagFilter;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-heading-2 text-ink-gray">Discover Procurers</h1>
          <p className="text-body-md text-mid-gray mt-1">
            {counterparts.length === allCounterparts.length
              ? `${allCounterparts.length} procurers in this event`
              : `Showing ${counterparts.length} matched procurers · ${allCounterparts.length} total`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
          <input
            type="text"
            placeholder="Search by company name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-light-border rounded-xl text-body-sm bg-white focus:outline-none focus:ring-2 focus:ring-calm-blue"
          />
        </div>
        <div className="relative">
          <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="pl-8 pr-8 py-2 border border-light-border rounded-xl text-body-sm bg-white focus:outline-none focus:ring-2 focus:ring-calm-blue appearance-none min-w-[160px]"
          >
            <option value="">All Industries</option>
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="pl-8 pr-8 py-2 border border-light-border rounded-xl text-body-sm bg-white focus:outline-none focus:ring-2 focus:ring-calm-blue appearance-none min-w-[140px]"
          >
            <option value="">All Tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button
            onClick={() => {
              setSearch("");
              setIndustryFilter("");
              setTagFilter("");
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-body-sm text-mid-gray border border-light-border hover:bg-off-white"
          >
            <X size={13} />
            Clear
          </button>
        )}
      </div>

      {/* Show all toggle when showing filtered results */}
      {counterparts.length < allCounterparts.length && !hasFilters && (
        <p className="text-body-sm text-mid-gray">
          Showing procurers matching your industry/tags.{" "}
          <button
            onClick={() => setCounterparts(allCounterparts)}
            className="text-calm-blue hover:underline font-medium"
          >
            Show all {allCounterparts.length}
          </button>
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-mid-gray flex flex-col items-center gap-3">
          <SlidersHorizontal size={32} strokeWidth={1.2} />
          <p className="text-body-md">No procurers found matching your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CounterpartCard
              key={c.id}
              counterpart={c}
              loading={requesting === c.id}
              matchCapReached={matchCapReached}
              onViewProfile={() => setDrawerProfile(c)}
              onRequestMatch={() => requestMatch(c.id)}
            />
          ))}
        </div>
      )}

      {/* Profile Drawer */}
      {drawerProfile && (
        <ProfileDrawer
          profile={drawerProfile}
          onClose={() => setDrawerProfile(null)}
          onRequestMatch={requestMatch}
          matchCapReached={matchCapReached}
        />
      )}
    </div>
  );
}

function CounterpartCard({
  counterpart,
  loading,
  matchCapReached,
  onViewProfile,
  onRequestMatch,
}: {
  counterpart: Counterpart;
  loading: boolean;
  matchCapReached: boolean;
  onViewProfile: () => void;
  onRequestMatch: () => void;
}) {
  const tags = (counterpart.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="bg-white rounded-2xl border border-light-border p-5 flex flex-col gap-4 shadow-xs hover:shadow-md transition-shadow">
      {/* Logo + name */}
      <div className="flex items-center gap-3">
        {counterpart.logo_url ? (
          <img
            src={counterpart.logo_url}
            alt={counterpart.company_name}
            className="w-12 h-12 rounded-xl object-contain border border-light-border bg-off-white"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-pale-blue-tint flex items-center justify-center text-calm-blue font-bold text-lg">
            {counterpart.company_name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-body-md text-ink-gray truncate">
            {counterpart.company_name}
          </p>
          {counterpart.industries?.name && (
            <span className="inline-block px-2 py-0.5 bg-calm-blue/10 text-calm-blue text-label font-semibold rounded-full">
              {counterpart.industries.name}
            </span>
          )}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 bg-off-white border border-light-border text-body-sm text-ink-gray rounded-full"
            >
              {t}
            </span>
          ))}
          {tags.length > 4 && (
            <span className="px-2 py-0.5 text-body-sm text-mid-gray">
              +{tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Bio */}
      {counterpart.bio && (
        <p className="text-body-sm text-mid-gray line-clamp-2">{counterpart.bio}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onViewProfile}
          className="flex-1 py-2 rounded-lg border border-light-border text-ink-gray text-body-sm font-medium hover:bg-pale-blue-tint transition-colors"
        >
          View Profile
        </button>
        {counterpart.already_requested ? (
          <button
            disabled
            className="flex-1 py-2 rounded-lg bg-mid-gray/15 text-mid-gray text-body-sm font-medium cursor-not-allowed"
          >
            Requested
          </button>
        ) : matchCapReached ? (
          <button
            disabled
            className="flex-1 py-2 rounded-lg bg-mid-gray/15 text-mid-gray text-body-sm font-medium cursor-not-allowed"
          >
            Cap Reached
          </button>
        ) : (
          <button
            onClick={onRequestMatch}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-calm-blue text-white text-body-sm font-medium hover:bg-deep-blue disabled:opacity-50 transition-colors"
          >
            {loading ? "…" : "Request Match"}
          </button>
        )}
      </div>
    </div>
  );
}
