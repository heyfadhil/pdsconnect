import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get current user's profile
  const { data: me } = await supabase
    .from("users")
    .select("role, industry_id, tags")
    .eq("id", user.id)
    .single();

  if (!me) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const counterpartRole = me.role === "buyer" ? "seller" : "buyer";

  // Fetch participants and existing matches in parallel
  const [{ data: participants, error }, { data: existingMatches }] = await Promise.all([
    supabase
      .from("event_participants")
      .select(
        `user_id,
         users (
           id, name, company_name, bio, logo_url, banner_url, website_url, tags, industry_id,
           industries ( id, name )
         )`
      )
      .eq("event_id", eventId)
      .eq("role_in_event", counterpartRole)
      .eq("is_active", true)
      .neq("user_id", user.id),
    supabase
      .from("match_requests")
      .select("buyer_id, seller_id, status")
      .eq("event_id", eventId)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .not("status", "in", '("cancelled","declined")'),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const requestedSet = new Set(
    (existingMatches ?? []).map((m) =>
      me.role === "buyer" ? m.seller_id : m.buyer_id
    )
  );

  type UserRow = {
    id: string;
    name: string;
    company_name: string;
    bio: string | null;
    logo_url: string | null;
    banner_url: string | null;
    website_url: string | null;
    tags: string | null;
    industry_id: string | null;
    industries: { id: string; name: string } | null;
  };

  const counterparts = (participants ?? [])
    .filter((p) => p.users)
    .map((p) => {
      const u = p.users as unknown as UserRow;
      return {
        ...u,
        already_requested: requestedSet.has(u.id),
      };
    });

  // Compute overlap
  const splitTags = (s: string | null) =>
    (s ?? "").split(",").map((t: string) => t.trim().toLowerCase()).filter(Boolean);

  const myTags = splitTags(me.tags);

  const hasOverlap = (u: UserRow) => {
    if (me.industry_id && u.industry_id === me.industry_id) return true;
    const theirTags = splitTags(u.tags);
    return myTags.some((t: string) => theirTags.includes(t));
  };

  const filtered = counterparts.filter((c) => hasOverlap(c));
  const result = filtered.length > 0 ? filtered : counterparts;

  // Sort: not requested first, then alphabetically
  result.sort((a, b) => {
    if (a.already_requested !== b.already_requested)
      return a.already_requested ? 1 : -1;
    return (a.company_name ?? "").localeCompare(b.company_name ?? "");
  });

  return NextResponse.json({ counterparts: result, all: counterparts });
}
