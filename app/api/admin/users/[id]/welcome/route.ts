import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Get user record
  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("email, name, company_name")
    .eq("id", id)
    .single();

  if (userErr || !user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Generate password reset link
  const { data: linkData, error: linkErr } = await adminSupabase.auth.admin.generateLink({
    type: "recovery",
    email: user.email,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login` },
  });

  if (linkErr || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: "Failed to generate reset link." }, { status: 500 });
  }

  const resetLink = linkData.properties.action_link;

  // Send welcome email via Resend
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "PDS Connect <noreply@pdsconnect.com>",
      to: user.email,
      subject: "Welcome to PDS Connect — Set Your Password",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <div style="background: #2E7FD9; padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Welcome to PDS Connect</h1>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid #D8E6F5; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #3A3A3A; font-size: 15px; margin: 0 0 16px;">Hi ${user.name},</p>
            <p style="color: #3A3A3A; font-size: 15px; margin: 0 0 24px;">
              Your account for <strong>${user.company_name}</strong> on PDS Connect has been activated.
              Click the button below to set your password and get started.
            </p>
            <a href="${resetLink}" style="display: inline-block; padding: 14px 28px; background: #2E7FD9; color: white; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">
              Set My Password
            </a>
            <p style="color: #8A8A8A; font-size: 13px; margin: 24px 0 0;">
              This link expires in 24 hours. If you didn't expect this email, please ignore it.
            </p>
          </div>
        </div>
      `,
    });
  }

  // Mark welcome_sent and is_active
  await supabase
    .from("users")
    .update({ welcome_sent: true, is_active: true })
    .eq("id", id);

  // Log email
  await supabase.from("email_logs").insert({
    user_id: id,
    type: "welcome",
    status: "sent",
  });

  return NextResponse.json({ success: true });
}
