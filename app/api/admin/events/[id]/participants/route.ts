import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

// GET — list all participants in an event
export async function GET(_req: NextRequest, { params }: Params) {
  const { id: eventId } = await params;
  const adminSupabase = createAdminClient();

  const { data, error } = await adminSupabase
    .from("event_participants")
    .select(
      `id, role_in_event, is_active,
       users (id, email, name, company_name, logo_url, is_active, industries(name))`
    )
    .eq("event_id", eventId)
    .order("id", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ participants: data ?? [] });
}

// POST — add one or many users to the event
export async function POST(request: NextRequest, { params }: Params) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const body = await request.json();
  const send_email: boolean = body.send_email ?? false;

  // Normalise to array of user_ids
  let userIds: string[];
  if (Array.isArray(body.user_ids) && body.user_ids.length > 0) {
    userIds = body.user_ids;
  } else if (body.user_id) {
    userIds = [body.user_id];
  } else {
    return NextResponse.json({ error: "user_id or user_ids required." }, { status: 400 });
  }

  // Fetch user profiles
  const { data: userProfiles, error: profilesErr } = await adminSupabase
    .from("users")
    .select("id, email, name, role, is_active")
    .in("id", userIds);

  if (profilesErr) return NextResponse.json({ error: profilesErr.message }, { status: 500 });

  const profileMap = new Map((userProfiles ?? []).map((u) => [u.id, u]));

  // Get event info for emails
  const { data: event } = await supabase
    .from("events")
    .select("name, event_start_date, venue_name")
    .eq("id", eventId)
    .single();

  let added = 0;
  let reactivated = 0;
  const errors: { user_id: string; error: string }[] = [];

  for (const user_id of userIds) {
    const profile = profileMap.get(user_id);
    if (!profile) { errors.push({ user_id, error: "User not found." }); continue; }

    const role_in_event = (profile.role === "buyer" || profile.role === "seller") ? profile.role : null;
    if (!role_in_event) { errors.push({ user_id, error: `Role "${profile.role}" must be buyer or seller.` }); continue; }

    // Check if already a participant
    const { data: existing } = await adminSupabase
      .from("event_participants")
      .select("id, is_active")
      .eq("event_id", eventId)
      .eq("user_id", user_id)
      .maybeSingle();

    if (existing) {
      if (!existing.is_active) {
        await adminSupabase
          .from("event_participants")
          .update({ is_active: true, role_in_event })
          .eq("id", existing.id);
        reactivated++;
      }
      // already active — skip
      continue;
    }

    // Insert new participant
    const { error: insertErr } = await adminSupabase
      .from("event_participants")
      .insert({ event_id: eventId, user_id, role_in_event, is_active: true });

    if (insertErr) {
      errors.push({ user_id, error: insertErr.message });
      continue;
    }
    added++;

    // Send email notification if requested
    if (send_email && profile.is_active && profile.email && event) {
      try {
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const { Resend } = await import("resend");
          const resend = new Resend(resendKey);
          const startDate = event.event_start_date
            ? new Date(event.event_start_date).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })
            : "TBD";

          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
            to: profile.email,
            subject: `You've been added to ${event.name}`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;">
                <h2 style="color:#1A5FAA;margin-bottom:8px;">You've been added to an event</h2>
                <p>Hi ${profile.name},</p>
                <p>You have been assigned to participate in <strong>${event.name}</strong>.</p>
                <table style="border:1px solid #D8E6F5;border-radius:8px;padding:16px;width:100%;margin:24px 0;">
                  <tr><td style="color:#8A8A8A;font-size:13px;">Event</td><td style="font-weight:600;">${event.name}</td></tr>
                  ${event.venue_name ? `<tr><td style="color:#8A8A8A;font-size:13px;">Venue</td><td>${event.venue_name}</td></tr>` : ""}
                  <tr><td style="color:#8A8A8A;font-size:13px;">Date</td><td>${startDate}</td></tr>
                </table>
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://pdsconnect.com"}/login"
                   style="display:inline-block;background:#2E7FD9;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
                  Log In to PDS Connect
                </a>
              </div>
            `,
          });

          await supabase.from("email_logs").insert({ user_id, event_id: eventId, type: "event_assigned", status: "sent" });
        }
      } catch {
        // Non-fatal
      }
    }
  }

  return NextResponse.json({ added, reactivated, errors }, { status: 201 });
}
