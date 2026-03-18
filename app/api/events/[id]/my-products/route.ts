import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/events/[id]/my-products — get product IDs selected for this event
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("event_products")
    .select("product_id, display_order")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .order("display_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ selected: (data ?? []).map((r) => r.product_id) });
}

// PUT /api/events/[id]/my-products — replace entire selection for this event
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { product_ids } = await req.json() as { product_ids: string[] };

  // Delete current selection
  await supabase
    .from("event_products")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  // Insert new selection
  if (product_ids?.length > 0) {
    const rows = product_ids.map((pid, i) => ({
      event_id: eventId,
      user_id: user.id,
      product_id: pid,
      display_order: i,
    }));
    const { error } = await supabase.from("event_products").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
