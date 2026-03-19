import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, event_categories(*), event_tags(*)")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ event: data });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  // Only allow updatable fields
  const allowed = [
    "name", "description", "venue_name", "venue_address",
    "event_start_date", "event_end_date",
    "matchup_open_date", "matchup_close_date",
    "max_matches_per_buyer", "max_matches_per_seller", "status", "thumbnail_url",
  ];
  const update: Record<string, unknown> = {};
  allowed.forEach((k) => { if (k in body) update[k] = body[k] ?? null; });

  const { data, error } = await supabase
    .from("events")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
