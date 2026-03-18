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

  const { data, error } = await supabase
    .from("match_requests")
    .select(
      `id, status, created_at, seller_notified,
       buyer:users!buyer_id (id, name, company_name, logo_url, bio, tags, industry_id, industries(name))`
    )
    .eq("event_id", eventId)
    .eq("seller_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark inbox as seen
  await supabase
    .from("match_requests")
    .update({ seller_notified: true })
    .eq("event_id", eventId)
    .eq("seller_id", user.id)
    .eq("status", "pending")
    .eq("seller_notified", false);

  return NextResponse.json({ requests: data ?? [] });
}
