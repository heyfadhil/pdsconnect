import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

// Vercel Cron: runs every hour
// Sends reminders for negotiations stalled past the reminder threshold
// Auto-cancels negotiations stalled past the auto-cancel threshold
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@pdsconnect.com";

  // Get system settings
  const { data: settings } = await supabase
    .from("system_settings")
    .select("negotiation_reminder_hours, negotiation_auto_cancel_hours, admin_notification_emails")
    .single();

  const reminderHours = settings?.negotiation_reminder_hours ?? 24;
  const autoCancelHours = settings?.negotiation_auto_cancel_hours ?? 48;

  const now = Date.now();
  const reminderThreshold = new Date(now - reminderHours * 60 * 60 * 1000).toISOString();
  const autoCancelThreshold = new Date(now - autoCancelHours * 60 * 60 * 1000).toISOString();

  // Fetch all pending negotiations with related match + user info
  const { data: negotiations } = await supabase
    .from("time_negotiations")
    .select(
      `id, created_at, proposed_by,
       match_requests (
         id, status, event_id,
         buyer:users!buyer_id (id, email, name, company_name),
         seller:users!seller_id (id, email, name, company_name)
       )`
    )
    .eq("status", "pending");

  if (!negotiations?.length) {
    return NextResponse.json({ processed: 0, reminders: 0, cancelled: 0 });
  }

  let reminders = 0;
  let cancelled = 0;

  for (const neg of negotiations) {
    const createdAt = new Date(neg.created_at).getTime();
    const match = neg.match_requests as unknown as {
      id: string;
      status: string;
      event_id: string;
      buyer: { id: string; email: string; name: string; company_name: string } | null;
      seller: { id: string; email: string; name: string; company_name: string } | null;
    } | null;

    if (!match) continue;

    // Auto-cancel if past the auto-cancel threshold
    if (createdAt < new Date(autoCancelThreshold).getTime()) {
      await supabase
        .from("time_negotiations")
        .update({ status: "cancelled" })
        .eq("id", neg.id);

      await supabase
        .from("match_requests")
        .update({ status: "cancelled", cancel_reason: "Auto-cancelled: negotiation timeout" })
        .eq("id", match.id);

      // Notify both parties
      if (resend && match.buyer && match.seller) {
        const responder =
          neg.proposed_by === match.buyer.id ? match.seller : match.buyer;

        await resend.emails.send({
          from: fromEmail,
          to: [match.buyer.email, match.seller.email],
          subject: "Meeting Request Cancelled — No Response",
          html: `
            <p>Hi,</p>
            <p>The meeting request between <strong>${match.buyer.company_name}</strong> and <strong>${match.seller.company_name}</strong> has been automatically cancelled because no response was received within the required timeframe.</p>
            <p>If you believe this is an error, please contact the event organiser.</p>
            <p>— PDS Connect Team</p>
          `,
        }).catch(() => null);
      }

      cancelled++;
      continue;
    }

    // Send reminder if past the reminder threshold (only send once — check reminder_sent flag)
    if (createdAt < new Date(reminderThreshold).getTime()) {
      const { data: existing } = await supabase
        .from("time_negotiations")
        .select("reminder_sent")
        .eq("id", neg.id)
        .single();

      // Only send reminder once
      if (existing && !(existing as unknown as { reminder_sent: boolean }).reminder_sent) {
        await supabase
          .from("time_negotiations")
          .update({ reminder_sent: true } as Record<string, unknown>)
          .eq("id", neg.id);

        if (resend && match.buyer && match.seller) {
          const waitingOn =
            neg.proposed_by === match.buyer.id ? match.seller : match.buyer;

          await resend.emails.send({
            from: fromEmail,
            to: [waitingOn.email],
            subject: "Reminder: Meeting Time Awaiting Your Response",
            html: `
              <p>Hi ${waitingOn.name},</p>
              <p>A meeting time has been proposed between your company and your match partner, but we're still waiting for your response.</p>
              <p>Please log in to <strong>PDS Connect</strong> to accept or suggest a new time before the request is automatically cancelled.</p>
              <p>— PDS Connect Team</p>
            `,
          }).catch(() => null);
        }

        reminders++;
      }
    }
  }

  return NextResponse.json({
    processed: negotiations.length,
    reminders,
    cancelled,
  });
}
