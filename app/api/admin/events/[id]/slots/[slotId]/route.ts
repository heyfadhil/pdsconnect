import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; slotId: string }> }
) {
  const { slotId } = await params;
  const supabase = await createClient();
  const { error } = await supabase
    .from("time_slots")
    .delete()
    .eq("id", slotId)
    .eq("is_booked", false); // Never delete booked slots
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
