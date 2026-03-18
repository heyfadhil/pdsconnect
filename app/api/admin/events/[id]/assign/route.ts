import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Params = { params: Promise<{ id: string }> };

// GET — fetch stored ai_assignment_results for this event
export async function GET(_req: NextRequest, { params }: Params) {
  const { id: eventId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_assignment_results")
    .select(
      `id, ai_summary, relevance_score, tab, dismissed,
       users (id, name, company_name, email, role, bio, logo_url, tags, industry_id, industries(name))`
    )
    .eq("event_id", eventId)
    .eq("dismissed", false)
    .order("relevance_score", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Check which users are already participants
  const { data: existingParticipants } = await supabase
    .from("event_participants")
    .select("user_id")
    .eq("event_id", eventId)
    .eq("is_active", true);

  const participantSet = new Set((existingParticipants ?? []).map((p) => p.user_id));

  const results = (data ?? []).map((r) => ({
    ...r,
    already_participant: participantSet.has((r.users as unknown as { id: string })?.id),
  }));

  return NextResponse.json({ results });
}

// POST — run Gemini AI assignment for this event (fresh run)
export async function POST(request: NextRequest, { params }: Params) {
  const { id: eventId } = await params;
  const supabase = await createClient();

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: "Gemini API key not configured." }, { status: 503 });
  }

  // Get event details
  const { data: event } = await supabase
    .from("events")
    .select("name, description, status")
    .eq("id", eventId)
    .single();

  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  // Get event categories and tags
  const [{ data: categories }, { data: eventTags }] = await Promise.all([
    supabase.from("event_categories").select("name").eq("event_id", eventId),
    supabase.from("event_tags").select("name").eq("event_id", eventId),
  ]);

  // Get all users NOT already active participants of this event
  const { data: existingParticipants } = await supabase
    .from("event_participants")
    .select("user_id")
    .eq("event_id", eventId)
    .eq("is_active", true);

  const alreadyInEvent = new Set((existingParticipants ?? []).map((p) => p.user_id));

  const { data: allUsers } = await supabase
    .from("users")
    .select("id, name, company_name, bio, website_url, tags, industry_id, role, industries(name)")
    .in("role", ["buyer", "seller"])
    .eq("is_active", true);

  const candidates = (allUsers ?? []).filter((u) => !alreadyInEvent.has(u.id));

  if (candidates.length === 0) {
    return NextResponse.json({ error: "No eligible users to analyze." }, { status: 400 });
  }

  // Fetch website snippets (up to 500 chars each, fail gracefully)
  const websiteSnippets: Record<string, string> = {};
  await Promise.allSettled(
    candidates
      .filter((u) => u.website_url)
      .slice(0, 30) // limit concurrent fetches
      .map(async (u) => {
        try {
          const res = await fetch(u.website_url!, {
            signal: AbortSignal.timeout(5000),
            headers: { "User-Agent": "Mozilla/5.0 (compatible; PDSConnect/1.0)" },
          });
          if (res.ok) {
            const html = await res.text();
            // Strip HTML tags, collapse whitespace, take first 500 chars
            const text = html
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 500);
            websiteSnippets[u.id] = text;
          }
        } catch {
          // Ignore fetch errors
        }
      })
  );

  // Build user profile summaries for Gemini
  const userProfiles = candidates.map((u) => {
    const parts = [
      `ID: ${u.id}`,
      `Company: ${u.company_name}`,
      `Role: ${u.role}`,
      `Industry: ${(u.industries as unknown as { name: string } | null)?.name ?? "Unknown"}`,
      `Tags: ${u.tags ?? "None"}`,
      `Bio: ${u.bio ?? "Not provided"}`,
    ];
    if (websiteSnippets[u.id]) {
      parts.push(`Website excerpt: ${websiteSnippets[u.id]}`);
    }
    return parts.join("\n");
  });

  const eventContext = [
    `Event: ${event.name}`,
    event.description ? `Description: ${event.description}` : null,
    categories?.length ? `Categories: ${categories.map((c) => c.name).join(", ")}` : null,
    eventTags?.length ? `Tags: ${eventTags.map((t) => t.name).join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You are an expert business matchmaking assistant for PDS Connect, a B2B business matching platform.

EVENT CONTEXT:
${eventContext}

TASK:
Analyze each company profile below and determine how relevant they are to this event. For each company:
1. Write a concise AI Summary (1-2 sentences) explaining why this company is or isn't relevant to the event
2. Assign a Relevance Score from 0 to 100 (higher = more relevant)

Score guidance:
- 70-100: Strong fit — clearly relevant industry, tags, or business focus
- 40-69: Partial fit — some overlap but not a perfect match
- 0-39: Weak fit — limited relevance to this event

Return ONLY a valid JSON array. No markdown, no code fences, no preamble. Format:
[
  {
    "user_id": "the-uuid-here",
    "summary": "Brief explanation of relevance.",
    "score": 85
  }
]

COMPANY PROFILES:
${userProfiles.join("\n\n---\n\n")}`;

  let geminiResults: Array<{ user_id: string; summary: string; score: number }> = [];

  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
    geminiResults = JSON.parse(cleaned);
  } catch (err) {
    return NextResponse.json(
      { error: `Gemini API error: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }

  // Delete previous run results for this event
  await supabase.from("ai_assignment_results").delete().eq("event_id", eventId);

  // Insert new results
  const rows = geminiResults
    .filter((r) => r.user_id && typeof r.score === "number")
    .map((r) => ({
      event_id: eventId,
      user_id: r.user_id,
      ai_summary: r.summary ?? "",
      relevance_score: Math.min(100, Math.max(0, Math.round(r.score))),
      tab: r.score >= 70 ? "confirmed" : "might_be_related",
      dismissed: false,
    }));

  const { data: inserted, error: insertErr } = await supabase
    .from("ai_assignment_results")
    .insert(rows)
    .select();

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  return NextResponse.json({ count: inserted?.length ?? 0, results: inserted });
}
