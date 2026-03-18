import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string; participantId: string }> };

// PATCH — update participant (e.g. toggle is_active)
export async function PATCH(request: NextRequest, { params }: Params) {
  const { participantId } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("event_participants")
    .update(body)
    .eq("id", participantId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ participant: data });
}

// DELETE — remove participant from event
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { participantId } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("event_participants")
    .delete()
    .eq("id", participantId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
