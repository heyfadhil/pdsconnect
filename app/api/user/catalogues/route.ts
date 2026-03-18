import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("catalogues")
    .select("id, name, file_url, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ catalogues: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, file_url } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Catalogue name is required." }, { status: 400 });
  if (!file_url?.trim()) return NextResponse.json({ error: "File URL is required." }, { status: 400 });

  const { data, error } = await supabase
    .from("catalogues")
    .insert({ user_id: user.id, name: name.trim(), file_url: file_url.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ catalogue: data }, { status: 201 });
}
