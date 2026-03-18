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

  // Fetch the match
  const { data: match, error: matchErr } = await supabase
    .from("match_requests")
    .select(
      `id, status, buyer_id, procurer_id, event_id, time_slot_id,
       time_negotiations (id, proposed_by, status, time_slot_id, expires_at)`
    )
    .eq("id", matchId)
    .eq("event_id", eventId)
    .single();

  if (matchErr || !match)
    return NextResponse.json({ error: "Match not found." }, { status: 404 });

  const isbuyer = match.buyer_id === user.id;
  const isProcurer = match.procurer_id === user.id;
  if (!isbuyer && !isProcurer)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const negotiations = (match.time_negotiations as Array<{
    id: string;
    proposed_by: string;
    status: string;
    time_slot_id: string;
    expires_at: string;
  }>).sort((a, b) => a.expires_at.localeCompare(b.expires_at));

  const latestNeg = negotiations.filter((n) => n.status === "pending").at(-1);

  // ─── cancel ──────────────────────────────────────────────
  if (action === "cancel") {
    if (!isbuyer || match.status !== "pending")
      return NextResponse.json({ error: "Cannot cancel this match." }, { status: 400 });

    await supabase
      .from("match_requests")
      .update({ status: "cancelled", cancel_reason: "buyer_cancelled", procurer_notified: false })
      .eq("id", matchId);

    return NextResponse.json({ success: true });
  }

  // ─── accept ──────────────────────────────────────────────
  if (action === "accept") {
    const canBuyerAccept =
      isbuyer &&
      (match.status === "awaiting_buyer" ||
        (match.status === "negotiating" && latestNeg?.proposed_by === "procurer"));
    const canProcurerAccept =
      isProcurer &&
      match.status === "negotiating" &&
      latestNeg?.proposed_by === "buyer";

    if (!canBuyerAccept && !canProcurerAccept)
      return NextResponse.json({ error: "Cannot accept at this stage." }, { status: 400 });

    const slotId = latestNeg?.time_slot_id ?? match.time_slot_id;
    if (!slotId)
      return NextResponse.json({ error: "No proposed slot to accept." }, { status: 400 });

    // Accept the negotiation
    if (latestNeg) {
      await supabase
        .from("time_negotiations")
        .update({ status: "accepted" })
        .eq("id", latestNeg.id);
    }

    // Book the slot
    await supabase.from("time_slots").update({ is_booked: true }).eq("id", slotId);

    // Update match
    await supabase
      .from("match_requests")
      .update({
        status: "scheduled",
        time_slot_id: slotId,
        buyer_notified: isProcurer ? false : true,
        procurer_notified: isbuyer ? false : true,
      })
      .eq("id", matchId);

    return NextResponse.json({ success: true });
  }

  // ─── reject ───────────────────────────────────────────────
  if (action === "reject") {
    // Buyer rejects (cancels match after procurer confirmed)
    if (!isbuyer)
      return NextResponse.json({ error: "Only the buyer can reject." }, { status: 400 });
    if (!["awaiting_buyer", "negotiating"].includes(match.status))
      return NextResponse.json({ error: "Cannot reject at this stage." }, { status: 400 });

    if (latestNeg) {
      await supabase
        .from("time_negotiations")
        .update({ status: "rejected" })
        .eq("id", latestNeg.id);
    }

    await supabase
      .from("match_requests")
      .update({
        status: "cancelled",
        cancel_reason: "buyer_rejected",
        procurer_notified: false,
      })
      .eq("id", matchId);

    return NextResponse.json({ success: true });
  }

  // ─── suggest-time ─────────────────────────────────────────
  if (action === "suggest-time") {
    if (!time_slot_id)
      return NextResponse.json({ error: "time_slot_id is required." }, { status: 400 });

    const buyerCanSuggest =
      isbuyer &&
      (match.status === "awaiting_buyer" ||
        (match.status === "negotiating" && latestNeg?.proposed_by === "procurer"));
    const procurerCanSuggest =
      isProcurer &&
      match.status === "negotiating" &&
      latestNeg?.proposed_by === "buyer";

    if (!buyerCanSuggest && !procurerCanSuggest)
      return NextResponse.json({ error: "Cannot suggest a time at this stage." }, { status: 400 });

    // Mark previous pending negotiation as countered
    if (latestNeg) {
      await supabase
        .from("time_negotiations")
        .update({ status: "countered" })
        .eq("id", latestNeg.id);
    }

    const proposedBy = isbuyer ? "buyer" : "procurer";
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    await supabase.from("time_negotiations").insert({
      match_request_id: matchId,
      proposed_by: proposedBy,
      time_slot_id,
      status: "pending",
      expires_at: expiresAt,
    });

    await supabase
      .from("match_requests")
      .update({
        status: "negotiating",
        buyer_notified: isProcurer ? false : true,
        procurer_notified: isbuyer ? false : true,
      })
      .eq("id", matchId);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
