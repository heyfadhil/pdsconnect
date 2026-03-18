import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("event_catalogues")
    .select("catalogue_id")
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ selected: (data ?? []).map((r) => r.catalogue_id) });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { catalogue_ids } = await req.json() as { catalogue_ids: string[] };

  await supabase
    .from("event_catalogues")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  if (catalogue_ids?.length > 0) {
    const rows = catalogue_ids.map((cid) => ({
      event_id: eventId,
      user_id: user.id,
      catalogue_id: cid,
    }));
    const { error } = await supabase.from("event_catalogues").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
