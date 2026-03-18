import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, company_name, email, phone, role_interest, message } = body;

    // Basic validation
    if (!full_name?.trim() || !company_name?.trim() || !email?.trim() || !role_interest) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Save to Supabase
    const supabase = await createClient();
    const { error: dbError } = await supabase.from("enquiries").insert({
      full_name: full_name.trim(),
      company_name: company_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      role_interest,
      message: message?.trim() || null,
      status: "new",
    });

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to save your enquiry. Please try again." },
        { status: 500 }
      );
    }

    // Send admin notification email
    const adminEmails = process.env.ADMIN_NOTIFICATION_EMAILS?.split(",").map(
      (e) => e.trim()
    ) ?? [];

    if (adminEmails.length > 0 && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const roleLabel =
        role_interest === "buyer"
          ? "Buyer"
          : role_interest === "procurer"
            ? "Procurer"
            : "Not sure yet";

      await resend.emails.send({
        from: "PDS Connect <noreply@pdsconnect.com>",
        to: adminEmails,
        subject: `New Enquiry: ${company_name} (${roleLabel})`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
            <div style="background: #2E7FD9; padding: 24px 32px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">New Enquiry Received</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">PDS Connect — Business Matching Platform</p>
            </div>
            <div style="background: white; padding: 32px; border: 1px solid #D8E6F5; border-top: none; border-radius: 0 0 12px 12px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #8A8A8A; font-size: 13px; width: 140px; vertical-align: top;">Full Name</td>
                  <td style="padding: 8px 0; color: #0D0D0D; font-size: 14px; font-weight: 600;">${full_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8A8A8A; font-size: 13px; vertical-align: top;">Company</td>
                  <td style="padding: 8px 0; color: #0D0D0D; font-size: 14px; font-weight: 600;">${company_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8A8A8A; font-size: 13px; vertical-align: top;">Email</td>
                  <td style="padding: 8px 0; color: #2E7FD9; font-size: 14px;"><a href="mailto:${email}" style="color: #2E7FD9;">${email}</a></td>
                </tr>
                ${phone ? `<tr><td style="padding: 8px 0; color: #8A8A8A; font-size: 13px; vertical-align: top;">Phone</td><td style="padding: 8px 0; color: #0D0D0D; font-size: 14px;">${phone}</td></tr>` : ""}
                <tr>
                  <td style="padding: 8px 0; color: #8A8A8A; font-size: 13px; vertical-align: top;">Role Interest</td>
                  <td style="padding: 8px 0;">
                    <span style="display: inline-block; padding: 3px 10px; border-radius: 99px; background: #EEF5FC; color: #2E7FD9; font-size: 13px; font-weight: 600;">${roleLabel}</span>
                  </td>
                </tr>
                ${message ? `<tr><td style="padding: 8px 0; color: #8A8A8A; font-size: 13px; vertical-align: top;">Message</td><td style="padding: 8px 0; color: #3A3A3A; font-size: 14px;">${message}</td></tr>` : ""}
              </table>

              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #D8E6F5;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/admin/enquiries"
                  style="display: inline-block; padding: 12px 24px; background: #2E7FD9; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
                  View in Admin Panel
                </a>
              </div>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Enquiry API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
