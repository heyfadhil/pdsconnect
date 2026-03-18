import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("time_slots")
    .select("*")
    .eq("event_id", id)
    .order("start_time");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ slots: data });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { slots } = await request.json();

  if (!Array.isArray(slots) || !slots.length) {
    return NextResponse.json({ error: "No slots provided." }, { status: 400 });
  }

  const rows = slots.map((s: { start_time: string; end_time: string }) => ({
    event_id: id,
    start_time: s.start_time,
    end_time: s.end_time,
    is_booked: false,
  }));

  const { data, error } = await supabase.from("time_slots").insert(rows).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ slots: data }, { status: 201 });
}
