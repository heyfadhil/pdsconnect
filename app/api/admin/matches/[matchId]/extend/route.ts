import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ matchId: string }> };

// Extend / reset the negotiation timer for a stalled match
export async function POST(_req: NextRequest, { params }: Params) {
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

  // Reset the latest pending negotiation's created_at to now
  const { data: negotiation } = await supabase
    .from("time_negotiations")
    .select("id")
    .eq("match_request_id", matchId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!negotiation) {
    return NextResponse.json({ error: "No pending negotiation found." }, { status: 404 });
  }

  const { error } = await supabase
    .from("time_negotiations")
    .update({ created_at: new Date().toISOString() })
    .eq("id", negotiation.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
