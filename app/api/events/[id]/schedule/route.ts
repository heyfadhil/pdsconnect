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

  const { data: myProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data, error } = await supabase
    .from("match_requests")
    .select(
      `id,
       buyer:users!buyer_id (id, name, company_name, logo_url),
       procurer:users!procurer_id (id, name, company_name, logo_url),
       booked_slot:time_slots!time_slot_id (id, start_time, end_time)`
    )
    .eq("event_id", eventId)
    .eq("status", "scheduled")
    .or(`buyer_id.eq.${user.id},procurer_id.eq.${user.id}`)
    .order("time_slot_id", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get event details for venue info
  const { data: event } = await supabase
    .from("events")
    .select("name, venue_name, venue_address, event_start_date, event_end_date")
    .eq("id", eventId)
    .single();

  type SlotRow = { id: string; start_time: string; end_time: string };

  // Group meetings by date
  const grouped: Record<string, typeof data> = {};
  (data ?? []).forEach((m) => {
    const slot = m.booked_slot as unknown as SlotRow | null;
    if (!slot) return;
    const date = slot.start_time.split("T")[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(m);
  });

  const schedule = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, meetings]) => ({ date, meetings }));

  return NextResponse.json({
    schedule,
    event,
    role: myProfile?.role,
    user_id: user.id,
  });
}
