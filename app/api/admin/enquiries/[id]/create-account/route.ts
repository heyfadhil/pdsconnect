import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: enq, error: enqErr } = await supabase
    .from("enquiries")
    .select("*")
    .eq("id", id)
    .single();

  if (enqErr || !enq) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
  if (enq.user_id) return NextResponse.json({ error: "Account already exists.", user_id: enq.user_id });

  // Create Auth account (no email sent yet)
  const { data: authUser, error: authErr } = await adminSupabase.auth.admin.createUser({
    email: enq.email,
    email_confirm: true,
    user_metadata: { name: enq.full_name },
  });

  if (authErr || !authUser?.user) {
    return NextResponse.json({ error: authErr?.message ?? "Failed to create auth account." }, { status: 500 });
  }

  const userId = authUser.user.id;

  // Insert user profile (inactive)
  const role = enq.role_interest === "buyer" ? "buyer" : enq.role_interest === "seller" ? "seller" : "buyer";
  await supabase.from("users").insert({
    id: userId,
    email: enq.email,
    name: enq.full_name,
    company_name: enq.company_name,
    role,
    is_active: false,
    welcome_sent: false,
  });

  // Link enquiry → user
  await supabase.from("enquiries").update({ user_id: userId, status: "account_created" }).eq("id", id);

  return NextResponse.json({ success: true, user_id: userId });
}
