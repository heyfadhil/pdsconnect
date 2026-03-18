import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

// POST — dismiss a result or move between tabs
export async function POST(request: NextRequest, { params }: Params) {
  const { id: eventId } = await params;
  const supabase = await createClient();

  const { result_id, action, tab } = await request.json();
  // action: "dismiss" | "move-tab"
  // tab: "confirmed" | "might_be_related" (for move-tab)

  if (!result_id) return NextResponse.json({ error: "result_id required." }, { status: 400 });

  let update: Record<string, unknown> = {};
  if (action === "dismiss") {
    update = { dismissed: true };
  } else if (action === "move-tab" && tab) {
    update = { tab };
  } else {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ai_assignment_results")
    .update(update)
    .eq("id", result_id)
    .eq("event_id", eventId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ result: data });
}
