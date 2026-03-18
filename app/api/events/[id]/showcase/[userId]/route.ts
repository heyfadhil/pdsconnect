import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id: eventId, userId } = await params;
  const supabase = await createClient();

  // Must be authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Both viewer and target must be participants in the same event
  const { data: participantCheck } = await supabase
    .from("event_participants")
    .select("user_id")
    .eq("event_id", eventId)
    .in("user_id", [user.id, userId]);

  const ids = (participantCheck ?? []).map((r) => r.user_id);
  if (!ids.includes(user.id) || !ids.includes(userId)) {
    return NextResponse.json({ products: [], catalogues: [] });
  }

  // Fetch products selected for this event by the target user
  const { data: eventProducts } = await supabase
    .from("event_products")
    .select("display_order, products(id, name, description, thumbnail_url)")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .order("display_order");

  // Fetch catalogues selected for this event by the target user
  const { data: eventCatalogues } = await supabase
    .from("event_catalogues")
    .select("catalogues(id, name, file_url)")
    .eq("event_id", eventId)
    .eq("user_id", userId);

  const products = (eventProducts ?? [])
    .map((ep) => ep.products)
    .filter(Boolean);

  const catalogues = (eventCatalogues ?? [])
    .map((ec) => ec.catalogues)
    .filter(Boolean);

  return NextResponse.json({ products, catalogues });
}
