import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Returns count of stalled negotiations (pending > reminder threshold)
export async function GET() {
  const supabase = await createClient();

  // Get reminder threshold from settings (default 24h)
  const { data: settings } = await supabase
    .from("system_settings")
    .select("negotiation_reminder_hours")
    .single();

  const reminderHours = settings?.negotiation_reminder_hours ?? 24;
  const thresholdTime = new Date(
    Date.now() - reminderHours * 60 * 60 * 1000
  ).toISOString();

  // Count pending negotiations older than threshold
  const { count } = await supabase
    .from("time_negotiations")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")
    .lt("created_at", thresholdTime);

  return NextResponse.json({ count: count ?? 0 });
}
