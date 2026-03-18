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

  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("email, name")
    .eq("id", id)
    .single();

  if (userErr || !user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const { data: linkData, error: linkErr } = await adminSupabase.auth.admin.generateLink({
    type: "recovery",
    email: user.email,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login` },
  });

  if (linkErr || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: "Failed to generate reset link." }, { status: 500 });
  }

  if (process.env.RESEND_API_KEY) {
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: sendErr } = await resend.emails.send({
      from: `PDS Connect <${fromEmail}>`,
      to: user.email,
      subject: "PDS Connect — Password Reset Request",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <div style="background: #2E7FD9; padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Password Reset</h1>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid #D8E6F5; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #3A3A3A; font-size: 15px; margin: 0 0 16px;">Hi ${user.name},</p>
            <p style="color: #3A3A3A; font-size: 15px; margin: 0 0 24px;">A password reset was requested for your PDS Connect account. Click below to set a new password.</p>
            <a href="${linkData.properties.action_link}" style="display: inline-block; padding: 14px 28px; background: #2E7FD9; color: white; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">Reset Password</a>
            <p style="color: #8A8A8A; font-size: 13px; margin: 24px 0 0;">This link expires in 24 hours. If you didn't request this, ignore this email.</p>
          </div>
        </div>
      `,
    });
    if (sendErr) {
      return NextResponse.json({ error: `Email failed to send: ${sendErr.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
