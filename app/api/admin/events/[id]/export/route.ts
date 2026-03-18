import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/events/[id]/export?type=participants|matches|schedule
export async function GET(request: NextRequest, { params }: Params) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "matches";

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!["admin", "superadmin", "staff"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get event name
  const { data: event } = await supabase
    .from("events")
    .select("name")
    .eq("id", eventId)
    .single();
  const eventName = event?.name ?? "event";
  const safeEventName = eventName.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();

  let rows: string[][] = [];
  let sheetName = "Export";
  let filename = "";

  if (type === "participants") {
    const { data } = await supabase
      .from("event_participants")
      .select("is_active, created_at, users (id, name, company_name, email, role, industry_id, tags, industries(name))")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    rows = [
      ["Name", "Company", "Email", "Role", "Industry", "Tags", "Active", "Joined"],
      ...(data ?? []).map((p) => {
        const u = p.users as unknown as {
          name: string; company_name: string; email: string;
          role: string; tags: string | null;
          industries: { name: string } | null;
        } | null;
        return [
          u?.name ?? "",
          u?.company_name ?? "",
          u?.email ?? "",
          u?.role ?? "",
          u?.industries?.name ?? "",
          u?.tags ?? "",
          p.is_active ? "Yes" : "No",
          new Date(p.created_at).toLocaleDateString("en-GB"),
        ];
      }),
    ];
    sheetName = "Participants";
    filename = `${safeEventName}_participants.xlsx`;

  } else if (type === "matches") {
    const { data } = await supabase
      .from("match_requests")
      .select(
        `status, cancel_reason, created_at,
         buyer:users!buyer_id (name, company_name),
         seller:users!seller_id (name, company_name),
         booked_slot:time_slots!time_slot_id (start_time, end_time)`
      )
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    rows = [
      ["Buyer Company", "Buyer Name", "Seller Company", "Seller Name", "Status", "Cancel Reason", "Scheduled Time", "Created"],
      ...(data ?? []).map((m) => {
        const buyer = m.buyer as unknown as { name: string; company_name: string } | null;
        const seller = m.seller as unknown as { name: string; company_name: string } | null;
        const slot = m.booked_slot as unknown as { start_time: string; end_time: string } | null;
        return [
          buyer?.company_name ?? "",
          buyer?.name ?? "",
          seller?.company_name ?? "",
          seller?.name ?? "",
          m.status,
          m.cancel_reason ?? "",
          slot ? new Date(slot.start_time).toLocaleString("en-GB") : "",
          new Date(m.created_at).toLocaleDateString("en-GB"),
        ];
      }),
    ];
    sheetName = "Matches";
    filename = `${safeEventName}_matches.xlsx`;

  } else if (type === "schedule") {
    const { data } = await supabase
      .from("match_requests")
      .select(
        `buyer:users!buyer_id (name, company_name),
         seller:users!seller_id (name, company_name),
         booked_slot:time_slots!time_slot_id (start_time, end_time)`
      )
      .eq("event_id", eventId)
      .eq("status", "scheduled")
      .order("created_at", { ascending: true });

    rows = [
      ["Date", "Start Time", "End Time", "Buyer Company", "Buyer Name", "Seller Company", "Seller Name"],
      ...(data ?? [])
        .filter((m) => m.booked_slot)
        .sort((a, b) => {
          const slotA = a.booked_slot as unknown as { start_time: string } | null;
          const slotB = b.booked_slot as unknown as { start_time: string } | null;
          return new Date(slotA?.start_time ?? 0).getTime() - new Date(slotB?.start_time ?? 0).getTime();
        })
        .map((m) => {
          const buyer = m.buyer as unknown as { name: string; company_name: string } | null;
          const seller = m.seller as unknown as { name: string; company_name: string } | null;
          const slot = m.booked_slot as unknown as { start_time: string; end_time: string } | null;
          const d = slot ? new Date(slot.start_time) : null;
          return [
            d ? d.toLocaleDateString("en-GB") : "",
            d ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "",
            slot ? new Date(slot.end_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "",
            buyer?.company_name ?? "",
            buyer?.name ?? "",
            seller?.company_name ?? "",
            seller?.name ?? "",
          ];
        }),
    ];
    sheetName = "Schedule";
    filename = `${safeEventName}_schedule.xlsx`;
  } else {
    return NextResponse.json({ error: "Invalid export type." }, { status: 400 });
  }

  // Build Excel workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Auto-fit column widths based on content
  const colWidths = rows[0].map((_, colIdx) =>
    Math.min(50, Math.max(10, ...rows.map((row) => String(row[colIdx] ?? "").length)))
  );
  ws["!cols"] = colWidths.map((w) => ({ wch: w }));

  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
