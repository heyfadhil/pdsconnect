import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UserNav from "@/components/user/UserNav";
import BottomNav from "@/components/mobile/BottomNav";

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
    <div className="min-h-screen bg-[#06101E] md:bg-[linear-gradient(145deg,_#EEF5FC_0%,_#F5F8FC_60%,_#EBF2FA_100%)]">
      {/* Desktop nav — hidden on mobile */}
      <div className="hidden md:block">
        <UserNav userName={profile.name} userRole="buyer" />
      </div>

      {/* Main content — on mobile add bottom padding for nav */}
      <main className="max-w-content mx-auto px-6 py-8 pb-[calc(2rem+72px)] md:pb-8">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav role="buyer" />
    </div>
  );
}
