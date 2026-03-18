import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("match_requests")
    .select(
      `id, status, cancel_reason, time_slot_id, created_at, updated_at,
       buyer_notified, procurer_notified,
       buyer:users!buyer_id (id, name, company_name, logo_url, industry_id, industries(name)),
       procurer:users!procurer_id (id, name, company_name, logo_url, industry_id, industries(name)),
       booked_slot:time_slots!time_slot_id (id, start_time, end_time),
       time_negotiations (
         id, proposed_by, status, expires_at,
         time_slots (id, start_time, end_time)
       )`
    )
    .eq("event_id", eventId)
    .or(`buyer_id.eq.${user.id},procurer_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark as seen — reset notification flag for current user
  const { data: myProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (myProfile?.role === "buyer") {
    await supabase
      .from("match_requests")
      .update({ buyer_notified: true })
      .eq("event_id", eventId)
      .eq("buyer_id", user.id)
      .eq("buyer_notified", false);
  } else {
    await supabase
      .from("match_requests")
      .update({ procurer_notified: true })
      .eq("event_id", eventId)
      .eq("procurer_id", user.id)
      .eq("procurer_notified", false);
  }

  return NextResponse.json({ matches: data ?? [] });
}

// POST — buyer creates a match request
export async function POST(request: NextRequest, { params }: Params) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { procurer_id } = await request.json();

  // Verify buyer is participant in this event
  const { data: buyerPart } = await supabase
    .from("event_participants")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .eq("role_in_event", "buyer")
    .eq("is_active", true)
    .single();

  if (!buyerPart)
    return NextResponse.json({ error: "You are not an active buyer in this event." }, { status: 403 });

  // Verify procurer is participant in this event
  const { data: procPart } = await supabase
    .from("event_participants")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", procurer_id)
    .eq("role_in_event", "procurer")
    .eq("is_active", true)
    .single();

  if (!procPart)
    return NextResponse.json({ error: "Invalid procurer for this event." }, { status: 400 });

  // Check no existing active match between them
  const { data: existing } = await supabase
    .from("match_requests")
    .select("id, status")
    .eq("event_id", eventId)
    .eq("buyer_id", user.id)
    .eq("procurer_id", procurer_id)
    .not("status", "in", '("cancelled","declined")')
    .maybeSingle();

  if (existing)
    return NextResponse.json({ error: "Match request already exists." }, { status: 409 });

  // Check buyer match cap
  const { data: event } = await supabase
    .from("events")
    .select("max_matches_per_buyer")
    .eq("id", eventId)
    .single();

  if (event?.max_matches_per_buyer != null) {
    const { count } = await supabase
      .from("match_requests")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("buyer_id", user.id)
      .not("status", "in", '("cancelled","declined")');

    if ((count ?? 0) >= event.max_matches_per_buyer)
      return NextResponse.json({ error: "You have reached the maximum match limit for this event." }, { status: 400 });
  }

  const { data: match, error } = await supabase
    .from("match_requests")
    .insert({
      event_id: eventId,
      buyer_id: user.id,
      procurer_id,
      status: "pending",
      procurer_notified: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ match }, { status: 201 });
}
