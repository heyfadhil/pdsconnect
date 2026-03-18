import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: eventId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("match_requests")
    .select(
      `id, status, cancel_reason, created_at, updated_at, time_slot_id,
       buyer:users!buyer_id (id, name, company_name),
       seller:users!seller_id (id, name, company_name),
       booked_slot:time_slots!time_slot_id (id, start_time, end_time)`
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ matches: data ?? [] });
}
