"use client";

import { useEffect, useState, use, useCallback } from "react";
import MatchCard from "@/components/user/MatchCard";
import { Handshake } from "lucide-react";

const IN_PROGRESS = ["pending", "awaiting_buyer", "negotiating"];
const COMPLETED = ["scheduled", "declined", "cancelled"];

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Match = any;

interface Props {
  params: Promise<{ id: string }>;
}

export default function BuyerMatchesPage({ params }: Props) {
  const { id: eventId } = use(params);
  const [matches, setMatches] = useState<Match[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"progress" | "completed">("progress");
  const [userId, setUserId] = useState("");

  const load = useCallback(async () => {
    const [matchRes, slotRes] = await Promise.all([
      fetch(`/api/events/${eventId}/matches`).then((r) => r.json()),
      fetch(`/api/events/${eventId}/slots`).then((r) => r.json()),
    ]);
    setMatches(matchRes.matches ?? []);
    setSlots(slotRes.slots ?? []);
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => setUserId(d.profile?.id ?? ""));
    load();
  }, [load]);

  async function handleAction(matchId: string, action: string, slotId?: string) {
    const res = await fetch(`/api/events/${eventId}/matches/${matchId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, time_slot_id: slotId }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Action failed.");
    }
    await load();
  }

  const inProgress = matches.filter((m: Match) => IN_PROGRESS.includes(m.status));
  const completed = matches.filter((m: Match) => COMPLETED.includes(m.status));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-mid-gray">
        Loading matches…
      </div>
    );
  }

  const current = tab === "progress" ? inProgress : completed;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-heading-2 text-ink-gray">My Matches</h1>
        <p className="text-body-md text-mid-gray mt-1">
          Track your match requests and scheduled meetings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-off-white border border-light-border rounded-xl p-1 w-fit">
        <TabBtn
          label={`In Progress${inProgress.length > 0 ? ` (${inProgress.length})` : ""}`}
          active={tab === "progress"}
          onClick={() => setTab("progress")}
        />
        <TabBtn
          label={`Completed${completed.length > 0 ? ` (${completed.length})` : ""}`}
          active={tab === "completed"}
          onClick={() => setTab("completed")}
        />
      </div>

      {current.length === 0 ? (
        <div className="py-16 text-center text-mid-gray flex flex-col items-center gap-3">
          <Handshake size={36} strokeWidth={1.2} />
          <p className="text-body-md">
            {tab === "progress" ? "No active matches yet." : "No completed matches yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-w-2xl">
          {current.map((m: Match) => (
            <MatchCard
              key={m.id}
              match={m}
              myRole="buyer"
              myUserId={userId}
              eventId={eventId}
              availableSlots={slots}
              onAction={handleAction}
            />
          ))}
        </div>
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
      className={`px-4 py-1.5 rounded-lg text-body-sm font-medium transition-colors ${
        active
          ? "bg-white shadow-xs text-calm-blue"
          : "text-mid-gray hover:text-ink-gray"
      }`}
    >
      {label}
    </button>
  );
}
