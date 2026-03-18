import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const eventId = searchParams.get("event_id");
  const search = searchParams.get("search");

  let query = supabase
    .from("match_requests")
    .select(
      `id, status, cancel_reason, created_at, updated_at, event_id,
       buyer:users!buyer_id (id, name, company_name),
       seller:users!seller_id (id, name, company_name),
       booked_slot:time_slots!time_slot_id (id, start_time, end_time),
       events (id, name)`
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (eventId) query = query.eq("event_id", eventId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let matches = data ?? [];

  // Client-side search filter (company name)
  if (search) {
    const q = search.toLowerCase();
    matches = matches.filter((m) => {
      const buyer = m.buyer as unknown as { company_name: string } | null;
      const seller = m.seller as unknown as { company_name: string } | null;
      return (
        buyer?.company_name?.toLowerCase().includes(q) ||
        seller?.company_name?.toLowerCase().includes(q)
      );
    });
  }

  return NextResponse.json({ matches });
}
