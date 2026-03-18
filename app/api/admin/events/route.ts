import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    name, description, venue_name, venue_address,
    event_start_date, event_end_date,
    matchup_open_date, matchup_close_date,
    max_matches_per_buyer, max_matches_per_procurer,
    status = "draft",
  } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Event name is required." }, { status: 400 });

  const { data, error } = await supabase
    .from("events")
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      venue_name: venue_name?.trim() || null,
      venue_address: venue_address?.trim() || null,
      event_start_date: event_start_date || null,
      event_end_date: event_end_date || null,
      matchup_open_date: matchup_open_date || null,
      matchup_close_date: matchup_close_date || null,
      max_matches_per_buyer: max_matches_per_buyer ?? null,
      max_matches_per_procurer: max_matches_per_procurer ?? null,
      status,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data }, { status: 201 });
}
