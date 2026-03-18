import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string; matchId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id: eventId, matchId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, time_slot_id } = await request.json();

  // Verify ownership
  const { data: match, error: matchErr } = await supabase
    .from("match_requests")
    .select("id, status, buyer_id, procurer_id")
    .eq("id", matchId)
    .eq("event_id", eventId)
    .eq("procurer_id", user.id)
    .single();

  if (matchErr || !match)
    return NextResponse.json({ error: "Match not found." }, { status: 404 });

  if (match.status !== "pending")
    return NextResponse.json({ error: "Match is no longer pending." }, { status: 400 });

  // ─── decline ────────────────────────────────────────────
  if (action === "decline") {
    await supabase
      .from("match_requests")
      .update({ status: "declined", buyer_notified: false })
      .eq("id", matchId);

    return NextResponse.json({ success: true });
  }

  // ─── confirm ─────────────────────────────────────────────
  if (action === "confirm") {
    if (!time_slot_id)
      return NextResponse.json({ error: "time_slot_id is required to confirm." }, { status: 400 });

    // Verify time slot belongs to this event and is not booked
    const { data: slot } = await supabase
      .from("time_slots")
      .select("id, is_booked")
      .eq("id", time_slot_id)
      .eq("event_id", eventId)
      .single();

    if (!slot) return NextResponse.json({ error: "Invalid time slot." }, { status: 400 });
    if (slot.is_booked) return NextResponse.json({ error: "Time slot is already booked." }, { status: 400 });

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    await supabase.from("time_negotiations").insert({
      match_request_id: matchId,
      proposed_by: "procurer",
      time_slot_id,
      status: "pending",
      expires_at: expiresAt,
    });

    await supabase
      .from("match_requests")
      .update({
        status: "awaiting_buyer",
        time_slot_id,
        buyer_notified: false,
        procurer_notified: true,
      })
      .eq("id", matchId);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
