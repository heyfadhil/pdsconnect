import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UserNav from "@/components/user/UserNav";

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("name, role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "buyer") redirect("/login");
  if (!profile.is_active) redirect("/login?error=inactive");

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(145deg, #EEF5FC 0%, #F5F8FC 60%, #EBF2FA 100%)" }}>
      <UserNav userName={profile.name} userRole="buyer" />
      <main className="max-w-content mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
