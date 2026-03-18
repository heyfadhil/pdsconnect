"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Search, RotateCw, UserPlus, X, ArrowLeftRight, Check, Users } from "lucide-react";

interface AIResult {
  id: string;
  ai_summary: string;
  relevance_score: number;
  tab: "confirmed" | "might_be_related";
  dismissed: boolean;
  already_participant: boolean;
  users: {
    id: string;
    name: string;
    company_name: string;
    email: string;
    role: string;
    bio: string | null;
    logo_url: string | null;
    tags: string | null;
    industries: { name: string } | null;
  };
}

type TabKey = "confirmed" | "might_be_related";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-emerald-50 text-emerald-700"
      : score >= 40
      ? "bg-amber-50 text-amber-700"
      : "bg-red-50 text-red-600";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-label font-bold ${color}`}>
      {score}%
    </span>
  );
}

export default function AssignPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [results, setResults] = useState<AIResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState("");
  const [tab, setTab] = useState<TabKey>("confirmed");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState("");
  const [sortByScore, setSortByScore] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/events/${eventId}/assign`).then((r) => r.json());
    setResults(res.results ?? []);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  async function runAI() {
    setRunning(true);
    setRunError("");
    const res = await fetch(`/api/admin/events/${eventId}/assign`, { method: "POST" });
    const d = await res.json();
    if (!res.ok) {
      setRunError(d.error ?? "AI assignment failed.");
    } else {
      await load();
    }
    setRunning(false);
  }

  async function dismiss(resultId: string) {
    await fetch(`/api/admin/events/${eventId}/assign/dismiss`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result_id: resultId, action: "dismiss" }),
    });
    setResults((prev) => prev.filter((r) => r.id !== resultId));
    setSelected((prev) => { prev.delete(resultId); return new Set(prev); });
  }

  async function moveTab(resultId: string, newTab: TabKey) {
    await fetch(`/api/admin/events/${eventId}/assign/dismiss`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result_id: resultId, action: "move-tab", tab: newTab }),
    });
    setResults((prev) =>
      prev.map((r) => (r.id === resultId ? { ...r, tab: newTab } : r))
    );
  }

  async function addSelectedWithRole(sendEmail: boolean) {
    const toAdd = results.filter(
      (r) => selected.has(r.id) && !r.already_participant
    );
    if (toAdd.length === 0) {
      setAddMsg("No new users selected.");
      setTimeout(() => setAddMsg(""), 3000);
      return;
    }
    setAdding(true);
    setAddMsg("");

    let added = 0;
    let skipped = 0;
    for (const r of toAdd) {
      const role = r.users.role ?? "buyer";
      const res = await fetch(`/api/admin/events/${eventId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: r.users.id,
          role_in_event: role,
          send_email: sendEmail,
        }),
      });
      if (res.ok) added++;
      else skipped++;
    }

    setAdding(false);
    setAddMsg(`${added} participant${added !== 1 ? "s" : ""} added${skipped > 0 ? `, ${skipped} skipped` : ""}.`);
    setSelected(new Set());
    await load();
    setTimeout(() => setAddMsg(""), 4000);
  }

  const tabResults = results
    .filter((r) => r.tab === tab)
    .filter((r) => {
      const s = search.toLowerCase();
      return (
        !s ||
        r.users.company_name.toLowerCase().includes(s) ||
        r.users.email.toLowerCase().includes(s) ||
        (r.users.tags ?? "").toLowerCase().includes(s) ||
        r.ai_summary.toLowerCase().includes(s)
      );
    })
    .sort((a, b) =>
      sortByScore ? b.relevance_score - a.relevance_score : 0
    );

  const confirmedCount = results.filter((r) => r.tab === "confirmed").length;
  const mightBeCount = results.filter((r) => r.tab === "might_be_related").length;

  const selectedCount = [...selected].filter(
    (id) => !results.find((r) => r.id === id)?.already_participant
  ).length;

  function toggleAll() {
    const tabIds = tabResults.filter((r) => !r.already_participant).map((r) => r.id);
    const allSelected = tabIds.every((id) => selected.has(id));
    if (allSelected) {
      tabIds.forEach((id) => selected.delete(id));
    } else {
      tabIds.forEach((id) => selected.add(id));
    }
    setSelected(new Set(selected));
  }

  if (loading) return <div className="p-8 text-mid-gray text-sm">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-body-sm text-mid-gray mb-1">
            <Link href={`/admin/events/${eventId}`} className="hover:text-calm-blue">← Event</Link>
            <span>/</span>
            <Link href={`/admin/events/${eventId}/participants`} className="hover:text-calm-blue">Participants</Link>
          </div>
          <h1 className="font-display text-heading-2 font-bold text-carbon-black flex items-center gap-2">
            <Sparkles size={22} className="text-calm-blue" />
            AI Participant Assignment
          </h1>
          <p className="text-body-sm text-mid-gray mt-1">
            Gemini analyses your user database against this event and scores each company&apos;s relevance.
          </p>
        </div>
        <button
          onClick={runAI}
          disabled={running}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-calm-blue text-white font-semibold text-body-sm hover:bg-deep-blue disabled:opacity-60 transition-colors"
        >
          {running ? (
            <>
              <RotateCw size={14} className="animate-spin" />
              Running AI…
            </>
          ) : (
            <>
              <Sparkles size={14} />
              {results.length > 0 ? "Re-run AI" : "Run AI Assignment"}
            </>
          )}
        </button>
      </div>

      {runError && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-body-sm text-red-700">
          {runError}
        </div>
      )}

      {results.length === 0 && !running ? (
        <div className="py-20 text-center text-mid-gray flex flex-col items-center gap-4">
          <Sparkles size={48} strokeWidth={1} className="text-calm-blue/40" />
          <p className="text-body-md font-medium text-ink-gray">No AI results yet.</p>
          <p className="text-body-sm max-w-sm">
            Click <strong>"Run AI Assignment"</strong> to analyse all users in your database
            against this event context. Gemini will score each company and generate AI summaries.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex gap-1 bg-off-white border border-light-border rounded-xl p-1">
              <TabBtn
                label={`Confirmed Matches (${confirmedCount})`}
                active={tab === "confirmed"}
                onClick={() => setTab("confirmed")}
              />
              <TabBtn
                label={`Might Be Related (${mightBeCount})`}
                active={tab === "might_be_related"}
                onClick={() => setTab("might_be_related")}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-light-border rounded-xl text-body-sm bg-white focus:outline-none focus:ring-2 focus:ring-calm-blue w-44"
                />
              </div>
              <button
                onClick={() => setSortByScore((s) => !s)}
                className={`px-3 py-1.5 rounded-xl text-body-sm border transition-colors ${
                  sortByScore
                    ? "border-calm-blue bg-pale-blue-tint text-calm-blue"
                    : "border-light-border text-mid-gray hover:border-calm-blue"
                }`}
              >
                Sort by score
              </button>
            </div>
          </div>

          {/* Add to event bar */}
          {selectedCount > 0 && (
            <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-calm-blue/5 border border-calm-blue/20 rounded-xl flex-wrap">
              <span className="text-body-sm font-medium text-calm-blue">
                {selectedCount} selected
              </span>
              <button
                onClick={() => addSelectedWithRole(false)}
                disabled={adding}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-calm-blue text-white text-body-sm font-medium hover:bg-deep-blue disabled:opacity-50 transition-colors"
              >
                <UserPlus size={13} />
                Add to Event
              </button>
              <button
                onClick={() => addSelectedWithRole(true)}
                disabled={adding}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-calm-blue text-calm-blue text-body-sm font-medium hover:bg-pale-blue-tint disabled:opacity-50 transition-colors"
              >
                <UserPlus size={13} />
                Add + Send Email
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="text-body-sm text-mid-gray hover:text-ink-gray"
              >
                Clear
              </button>
              {addMsg && (
                <span className="text-body-sm font-medium text-emerald-600 ml-auto">{addMsg}</span>
              )}
            </div>
          )}
          {addMsg && selectedCount === 0 && (
            <p className="mb-4 text-body-sm font-medium text-emerald-600">{addMsg}</p>
          )}

          {/* Select all */}
          {tabResults.length > 0 && (
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={toggleAll}
                className="text-body-sm text-calm-blue hover:underline font-medium"
              >
                {tabResults.filter((r) => !r.already_participant).every((r) => selected.has(r.id))
                  ? "Deselect all"
                  : "Select all"}
              </button>
              <span className="text-body-sm text-mid-gray">
                {tabResults.filter((r) => !r.already_participant).length} available
              </span>
            </div>
          )}

          {/* Results */}
          {tabResults.length === 0 ? (
            <div className="py-12 text-center text-mid-gray">
              <Users size={32} strokeWidth={1.2} className="mx-auto mb-3" />
              <p className="text-body-md">
                No results in this tab
                {search ? " matching your search" : ""}.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-light-border overflow-hidden shadow-sm">
              <table className="w-full text-body-sm">
                <thead>
                  <tr className="bg-pale-blue-tint border-b border-light-border">
                    <th className="pl-5 pr-2 py-3 w-8" />
                    <th className="px-3 py-3 text-left text-label font-semibold text-mid-gray uppercase tracking-wide">Company</th>
                    <th className="px-3 py-3 text-left text-label font-semibold text-mid-gray uppercase tracking-wide hidden lg:table-cell">Industry / Tags</th>
                    <th className="px-3 py-3 text-left text-label font-semibold text-mid-gray uppercase tracking-wide">Score</th>
                    <th className="px-3 py-3 text-left text-label font-semibold text-mid-gray uppercase tracking-wide hidden md:table-cell">AI Summary</th>
                    <th className="px-3 py-3 w-20" />
                  </tr>
                </thead>
                <tbody>
                  {tabResults.map((r) => {
                    const isSelected = selected.has(r.id);
                    const tags = (r.users.tags ?? "")
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);

                    return (
                      <tr
                        key={r.id}
                        className={`border-b border-light-border last:border-0 transition-colors ${
                          isSelected ? "bg-pale-blue-tint" : "hover:bg-off-white"
                        } ${r.already_participant ? "opacity-60" : ""}`}
                      >
                        {/* Checkbox */}
                        <td className="pl-5 pr-2 py-3">
                          {!r.already_participant ? (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const next = new Set(selected);
                                if (isSelected) next.delete(r.id);
                                else next.add(r.id);
                                setSelected(next);
                              }}
                              className="rounded border-light-border text-calm-blue focus:ring-calm-blue"
                            />
                          ) : (
                            <span title="Already a participant"><Check size={14} className="text-emerald-500 mx-auto" /></span>
                          )}
                        </td>

                        {/* Company */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {r.users.logo_url ? (
                              <img src={r.users.logo_url} alt="" className="w-8 h-8 rounded-lg object-contain border border-light-border bg-off-white" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-pale-blue-tint flex items-center justify-center text-calm-blue font-bold text-sm">
                                {r.users.company_name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-ink-gray leading-snug">{r.users.company_name}</p>
                              <p className="text-[11px] text-mid-gray">{r.users.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Industry / Tags */}
                        <td className="px-3 py-3 hidden lg:table-cell">
                          <div className="flex flex-col gap-1">
                            {r.users.industries?.name && (
                              <span className="text-[11px] font-medium text-mid-gray">
                                {r.users.industries.name}
                              </span>
                            )}
                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {tags.slice(0, 3).map((t) => (
                                  <span
                                    key={t}
                                    className="px-1.5 py-0.5 bg-off-white border border-light-border text-[11px] text-ink-gray rounded-full"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-3 py-3">
                          <ScoreBadge score={r.relevance_score} />
                        </td>

                        {/* AI Summary */}
                        <td className="px-3 py-3 text-mid-gray hidden md:table-cell max-w-xs">
                          <p className="line-clamp-2 text-[12px] leading-relaxed">{r.ai_summary}</p>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() =>
                                moveTab(
                                  r.id,
                                  r.tab === "confirmed" ? "might_be_related" : "confirmed"
                                )
                              }
                              title="Move to other tab"
                              className="p-1.5 rounded-lg text-mid-gray hover:text-calm-blue hover:bg-pale-blue-tint transition-colors"
                            >
                              <ArrowLeftRight size={13} />
                            </button>
                            <button
                              onClick={() => dismiss(r.id)}
                              title="Dismiss"
                              className="p-1.5 rounded-lg text-mid-gray hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TabBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-body-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? "bg-white shadow-xs text-calm-blue"
          : "text-mid-gray hover:text-ink-gray"
      }`}
    >
      {label}
    </button>
  );
}
