import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("event_participants")
    .select(
      `role_in_event,
       events (
         id, name, description,
         venue_name, venue_address,
         event_start_date, event_end_date,
         matchup_open_date, matchup_close_date,
         max_matches_per_buyer, max_matches_per_seller,
         status, thumbnail_url
       )`
    )
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type EventRow = {
    id: string;
    name: string;
    description: string | null;
    venue_name: string | null;
    venue_address: string | null;
    event_start_date: string | null;
    event_end_date: string | null;
    matchup_open_date: string | null;
    matchup_close_date: string | null;
    max_matches_per_buyer: number | null;
    max_matches_per_seller: number | null;
    status: string;
    thumbnail_url: string | null;
  };

  const today = new Date().toISOString().split("T")[0];

  const events = (data ?? [])
    .filter((p) => p.events)
    .map((p) => {
      const ev = p.events as unknown as EventRow;
      const withinWindow =
        ev.matchup_open_date != null &&
        ev.matchup_open_date <= today &&
        (ev.matchup_close_date == null || ev.matchup_close_date >= today);
      const isActive = ev.status === "live" && withinWindow;
      return { ...ev, role_in_event: p.role_in_event, isActive };
    })
    .sort((a, b) => {
      // Active first, then by event start date desc
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return (b.event_start_date ?? "").localeCompare(a.event_start_date ?? "");
    });

  return NextResponse.json({ events });
}
