import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("system_settings")
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "superadmin") {
    return NextResponse.json({ error: "Superadmin only." }, { status: 403 });
  }

  const body = await request.json();
  const allowedFields = [
    "negotiation_reminder_hours",
    "negotiation_auto_cancel_hours",
    "default_max_matches_buyer",
    "default_max_matches_procurer",
    "default_matchup_window_days",
    "admin_notification_emails",
  ];

  const update: Record<string, unknown> = { updated_by: user.id, updated_at: new Date().toISOString() };
  allowedFields.forEach((f) => {
    if (f in body) update[f] = body[f] === "" ? null : body[f];
  });

  const { data, error } = await supabase
    .from("system_settings")
    .update(update)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}
