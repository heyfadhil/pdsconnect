import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

// GET — list all participants in an event
export async function GET(_req: NextRequest, { params }: Params) {
  const { id: eventId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_participants")
    .select(
      `id, role_in_event, is_active, categories, tags,
       users (id, email, name, company_name, logo_url, is_active, industry_id, industries(name))`
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ participants: data ?? [] });
}

// POST — add a user to the event (optionally sends "assigned" notification email)
export async function POST(request: NextRequest, { params }: Params) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { user_id, role_in_event, send_email = false } = await request.json();

  if (!user_id || !role_in_event) {
    return NextResponse.json(
      { error: "user_id and role_in_event are required." },
      { status: 400 }
    );
  }

  // Check if already a participant
  const { data: existing } = await supabase
    .from("event_participants")
    .select("id, is_active")
    .eq("event_id", eventId)
    .eq("user_id", user_id)
    .maybeSingle();

  if (existing) {
    // Re-activate if previously deactivated
    if (!existing.is_active) {
      const { data: updated } = await supabase
        .from("event_participants")
        .update({ is_active: true, role_in_event })
        .eq("id", existing.id)
        .select()
        .single();
      return NextResponse.json({ participant: updated, reactivated: true });
    }
    return NextResponse.json({ error: "User is already a participant in this event." }, { status: 409 });
  }

  // Get user info for email
  const { data: userProfile } = await supabase
    .from("users")
    .select("email, name, is_active")
    .eq("id", user_id)
    .single();

  // Get event info for email
  const { data: event } = await supabase
    .from("events")
    .select("name, event_start_date, event_end_date, venue_name")
    .eq("id", eventId)
    .single();

  const { data: participant, error } = await supabase
    .from("event_participants")
    .insert({ event_id: eventId, user_id, role_in_event, is_active: true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send "assigned to event" email if user is active and email requested
  if (send_email && userProfile?.is_active && userProfile.email && event) {
    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        const startDate = event.event_start_date
          ? new Date(event.event_start_date).toLocaleDateString("en-MY", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "TBD";

        await resend.emails.send({
          from: "PDS Connect <noreply@pdsconnect.com>",
          to: userProfile.email,
          subject: `You've been added to ${event.name}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;">
              <h2 style="color:#1A5FAA;margin-bottom:8px;">You've been added to an event</h2>
              <p>Hi ${userProfile.name},</p>
              <p>You have been assigned to participate in <strong>${event.name}</strong>.</p>
              <table style="border:1px solid #D8E6F5;border-radius:8px;padding:16px;width:100%;margin:24px 0;">
                <tr><td style="color:#8A8A8A;font-size:13px;">Event</td><td style="font-weight:600;">${event.name}</td></tr>
                ${event.venue_name ? `<tr><td style="color:#8A8A8A;font-size:13px;">Venue</td><td>${event.venue_name}</td></tr>` : ""}
                <tr><td style="color:#8A8A8A;font-size:13px;">Date</td><td>${startDate}</td></tr>
              </table>
              <p>Log in to your PDS Connect account to browse participants and start requesting matches.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://pdsconnect.com"}/login"
                 style="display:inline-block;background:#2E7FD9;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px;">
                Log In to PDS Connect
              </a>
            </div>
          `,
        });

        // Log the email
        await supabase.from("email_logs").insert({
          user_id,
          event_id: eventId,
          type: "event_assigned",
          status: "sent",
        });

        // Update event participant record with email sent flag (if needed)
        await adminSupabase
          .from("event_participants")
          .update({ is_active: true })
          .eq("id", participant.id);
      }
    } catch {
      // Email failure is non-fatal — participant was still added
    }
  }

  return NextResponse.json({ participant }, { status: 201 });
}
