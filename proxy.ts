import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ADMIN_ROLES = ["admin", "staff", "superadmin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Admin routes ──────────────────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Redirect authenticated admin away from admin login
  if (pathname === "/admin/login" && user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile && ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // ── Buyer routes ──────────────────────────────────────────
  if (pathname.startsWith("/buyer")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "buyer") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ── Seller routes ───────────────────────────────────────
  if (pathname.startsWith("/seller")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "seller") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect authenticated end-user away from /login
  if (pathname === "/login" && user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "buyer") {
      return NextResponse.redirect(new URL("/buyer/dashboard", request.url));
    }
    if (profile?.role === "seller") {
      return NextResponse.redirect(
        new URL("/seller/dashboard", request.url)
      );
    }
  }

  // ── Profile route ─────────────────────────────────────────
  if (pathname === "/profile") {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/buyer/:path*", "/seller/:path*", "/login", "/profile"],
};
