import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";
import { Resend } from "resend";

type Row = {
  name?: string;
  email?: string;
  company_name?: string;
  role?: string;
  website_url?: string;
  industry?: string;
  bio?: string;
  logo_url?: string;
  phone?: string;
  mobile?: string;
  title?: string;
  business_type?: string;
  item?: string;
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });

  // Parse workbook
  const buffer = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Row[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

  if (!rows.length) return NextResponse.json({ error: "Spreadsheet is empty." }, { status: 400 });

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Fetch all industries for name→id mapping
  const { data: industries } = await supabase.from("industries").select("id, name");
  const industryMap = new Map(
    (industries ?? []).map((i) => [i.name.toLowerCase().trim(), i.id])
  );

  let created = 0;
  let updated = 0;
  const errors: { row: number; email: string; error: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed, row 1 is headers

    // Validate required fields
    const name = String(row.name ?? "").trim();
    const email = String(row.email ?? "").trim().toLowerCase();
    const company_name = String(row.company_name ?? "").trim();
    const role = String(row.role ?? "").trim().toLowerCase();

    if (!name || !email || !company_name) {
      errors.push({ row: rowNum, email: email || "—", error: "Missing required fields (name, email, company_name)." });
      continue;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({ row: rowNum, email, error: "Invalid email address." });
      continue;
    }

    if (!["buyer", "seller"].includes(role)) {
      errors.push({ row: rowNum, email, error: `Invalid role "${role}". Must be buyer or seller.` });
      continue;
    }

    // Resolve industry
    const industryName = String(row.industry ?? "").trim().toLowerCase();
    const industry_id = industryName ? (industryMap.get(industryName) ?? null) : null;

    // Check if user exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    const extraFields = {
      website_url: String(row.website_url ?? "").trim() || null,
      bio: String(row.bio ?? "").trim() || null,
      logo_url: String(row.logo_url ?? "").trim() || null,
      phone: String(row.phone ?? "").trim() || null,
      mobile: String(row.mobile ?? "").trim() || null,
      title: String(row.title ?? "").trim() || null,
      business_type: String(row.business_type ?? "").trim() || null,
      item: String(row.item ?? "").trim() || null,
    };

    if (existing) {
      // Update existing record
      await supabase.from("users").update({
        name,
        company_name,
        role,
        industry_id,
        ...extraFields,
      }).eq("id", existing.id);
      updated++;
    } else {
      // Create Auth account
      const { data: authUser, error: authErr } = await adminSupabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name, role },
      });

      if (authErr || !authUser?.user) {
        errors.push({ row: rowNum, email, error: authErr?.message ?? "Failed to create auth account." });
        continue;
      }

      // Insert user profile
      const { error: profileErr } = await supabase.from("users").insert({
        id: authUser.user.id,
        email,
        name,
        company_name,
        role,
        industry_id,
        is_active: true,
        welcome_sent: false,
        ...extraFields,
      });

      if (profileErr) {
        errors.push({ row: rowNum, email, error: profileErr.message });
        // Cleanup orphaned auth user
        await adminSupabase.auth.admin.deleteUser(authUser.user.id);
        continue;
      }

      // Send welcome email with reset link
      try {
        const { data: linkData } = await adminSupabase.auth.admin.generateLink({
          type: "recovery",
          email,
          options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login` },
        });

        if (linkData?.properties?.action_link && process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: "PDS Connect <noreply@pdsconnect.com>",
            to: email,
            subject: "Welcome to PDS Connect — Set Your Password",
            html: `
              <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
                <div style="background: #2E7FD9; padding: 24px 32px; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">Welcome to PDS Connect</h1>
                </div>
                <div style="background: white; padding: 32px; border: 1px solid #D8E6F5; border-top: none; border-radius: 0 0 12px 12px;">
                  <p style="color: #3A3A3A; font-size: 15px;">Hi ${name}, you've been added to PDS Connect as a <strong>${role}</strong>. Click below to set your password.</p>
                  <a href="${linkData.properties.action_link}" style="display: inline-block; margin: 20px 0; padding: 14px 28px; background: #2E7FD9; color: white; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">Set My Password</a>
                  <p style="color: #8A8A8A; font-size: 13px;">This link expires in 24 hours.</p>
                </div>
              </div>
            `,
          });

          // Mark welcome sent
          await supabase.from("users").update({ welcome_sent: true }).eq("id", authUser.user.id);
          await supabase.from("email_logs").insert({ user_id: authUser.user.id, type: "welcome", status: "sent" });
        }
      } catch {
        // Non-fatal — user created, email failed
      }

      created++;
    }
  }

  return NextResponse.json({ created, updated, errors });
}
