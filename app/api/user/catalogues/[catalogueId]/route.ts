import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ catalogueId: string }> }
) {
  const { catalogueId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, file_url } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required." }, { status: 400 });
  if (!file_url?.trim()) return NextResponse.json({ error: "File URL required." }, { status: 400 });

  const { data, error } = await supabase
    .from("catalogues")
    .update({ name: name.trim(), file_url: file_url.trim() })
    .eq("id", catalogueId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ catalogue: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ catalogueId: string }> }
) {
  const { catalogueId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("catalogues")
    .delete()
    .eq("id", catalogueId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
