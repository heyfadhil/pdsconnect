import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Returns count of unread match notifications for the current user
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ count: 0 });

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ count: 0 });

  let query;
  if (profile.role === "buyer") {
    query = supabase
      .from("match_requests")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id", user.id)
      .eq("buyer_notified", false);
  } else {
    query = supabase
      .from("match_requests")
      .select("id", { count: "exact", head: true })
      .eq("procurer_id", user.id)
      .eq("procurer_notified", false);
  }

  const { count } = await query;
  return NextResponse.json({ count: count ?? 0 });
}
