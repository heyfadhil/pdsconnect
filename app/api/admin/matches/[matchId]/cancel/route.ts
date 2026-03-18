import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ matchId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { matchId } = await params;
  const supabase = await createClient();

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!["admin", "superadmin", "staff"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const cancelReason = body.reason ?? "Cancelled by admin";

  const { error } = await supabase
    .from("match_requests")
    .update({ status: "cancelled", cancel_reason: cancelReason, updated_at: new Date().toISOString() })
    .eq("id", matchId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Cancel any pending negotiations for this match
  await supabase
    .from("time_negotiations")
    .update({ status: "cancelled" })
    .eq("match_request_id", matchId)
    .eq("status", "pending");

  return NextResponse.json({ success: true });
}
