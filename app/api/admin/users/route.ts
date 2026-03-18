import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const role = searchParams.get("role") ?? "";

  let query = supabase
    .from("users")
    .select("id, name, email, company_name, role, is_active, welcome_sent, industry_id, tags, industries(name)")
    .order("name");

  if (role) query = query.eq("role", role);
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Auth — admin only
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!["admin", "superadmin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, email, password, company_name, role, industry_id, tags } = body;

  if (!name || !email || !password || !company_name || !role) {
    return NextResponse.json({ error: "Name, email, password, company, and role are required." }, { status: 400 });
  }

  if (!["buyer", "seller"].includes(role)) {
    return NextResponse.json({ error: "Role must be buyer or seller." }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  // Create auth user
  const { data: authData, error: authErr } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 });

  const newUserId = authData.user.id;

  // Insert into users table
  const { data: newUser, error: insertErr } = await adminSupabase
    .from("users")
    .insert({
      id: newUserId,
      name,
      email,
      company_name,
      role,
      is_active: true,
      welcome_sent: false,
      industry_id: industry_id || null,
      tags: tags || null,
    })
    .select("id, name, email, company_name, role, is_active, welcome_sent")
    .single();

  if (insertErr) {
    // Rollback: delete the auth user
    await adminSupabase.auth.admin.deleteUser(newUserId);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ user: newUser }, { status: 201 });
}
