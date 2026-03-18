import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role, name, email")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "staff", "superadmin"].includes(profile.role)) {
    redirect("/admin/login");
  }

  // Fetch stalled negotiations count for sidebar badge
  const { data: settings } = await supabase
    .from("system_settings")
    .select("negotiation_reminder_hours")
    .single();
  const reminderHours = settings?.negotiation_reminder_hours ?? 24;
  const thresholdTime = new Date(Date.now() - reminderHours * 60 * 60 * 1000).toISOString();
  const { count: stalledCount } = await supabase
    .from("time_negotiations")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")
    .lt("created_at", thresholdTime);

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(145deg, #EEF5FC 0%, #F5F8FC 60%, #EBF2FA 100%)" }}
    >
      <Sidebar userRole={profile.role} stalledCount={stalledCount ?? 0} />
      <div className="ml-60">
        <Topbar name={profile.name} role={profile.role} />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
      </div>
    </div>
  );
}
