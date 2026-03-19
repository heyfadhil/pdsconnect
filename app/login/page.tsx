"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: profile } = await supabase
      .from("users")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (!profile?.is_active) {
      await supabase.auth.signOut();
      setError("Your account is not yet active. Please wait for the admin team to complete your onboarding.");
      setLoading(false);
      return;
    }

    if (profile.role === "buyer") {
      router.push("/buyer/dashboard");
    } else if (profile.role === "seller") {
      router.push("/seller/dashboard");
    } else if (["admin", "staff", "superadmin"].includes(profile.role)) {
      router.push("/admin/dashboard");
    } else {
      await supabase.auth.signOut();
      setError("Unrecognised account role. Please contact support.");
      setLoading(false);
      return;
    }
    router.refresh();
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/reset`,
    });
    if (resetError) {
      setError("Failed to send reset email. Please check the address and try again.");
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  const inputStyle = {
    background: "rgba(255,255,255,.07)",
    border: "1.5px solid rgba(255,255,255,.14)",
    color: "#ffffff",
    borderRadius: "12px",
    height: "48px",
    padding: "0 16px",
    width: "100%",
    outline: "none",
    fontSize: "15px",
    fontFamily: "inherit",
    transition: "border-color .2s, box-shadow .2s",
  } satisfies React.CSSProperties;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background:
          "radial-gradient(ellipse at 15% 25%,rgba(6,182,212,.22) 0%,transparent 55%), radial-gradient(ellipse at 85% 75%,rgba(46,127,217,.20) 0%,transparent 55%), radial-gradient(ellipse at 50% 95%,rgba(20,184,166,.14) 0%,transparent 55%), #06101E",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="w-full max-w-[420px] flex flex-col">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo variant="light" showTagline size="lg" />
          </Link>
        </div>

        {/* Card */}
        <div
          className="w-full rounded-[24px] p-8"
          style={{
            background: "rgba(255,255,255,.06)",
            backdropFilter: "blur(24px) saturate(1.3)",
            border: "1px solid rgba(255,255,255,.10)",
            boxShadow: "0 8px 40px rgba(0,0,0,.40), 0 0 0 1px rgba(255,255,255,.04) inset",
          }}
        >
          {resetSent ? (
            <div className="text-center py-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(0,212,255,.12)", border: "1px solid rgba(0,212,255,.25)" }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="text-[22px] font-black text-white mb-2" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>
                Check Your Email
              </h2>
              <p className="text-[13px] mb-6" style={{ color: "rgba(255,255,255,.55)" }}>
                We&apos;ve sent a password reset link to{" "}
                <strong className="text-white">{email}</strong>.
              </p>
              <button
                onClick={() => { setResetMode(false); setResetSent(false); }}
                className="text-[13px] font-semibold transition-opacity hover:opacity-70"
                style={{ color: "#00D4FF" }}
              >
                ← Back to Sign In
              </button>
            </div>
          ) : resetMode ? (
            <>
              <h1 className="text-[24px] font-black text-white mb-1" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>
                Forgot Password
              </h1>
              <p className="text-[13px] mb-8" style={{ color: "rgba(255,255,255,.50)" }}>
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <form onSubmit={handleReset} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-white">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    style={inputStyle}
                  />
                </div>
                {error && (
                  <p className="text-[13px] rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,.12)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,.25)" }}>
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-[12px] text-white font-black text-[15px] disabled:opacity-50 active:scale-[.98] transition-transform"
                  style={{ background: "linear-gradient(135deg,#2E7FD9,#06B6D4,#14B8A6)", boxShadow: "0 4px 20px rgba(6,182,212,.40)" }}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <button
                  type="button"
                  onClick={() => setResetMode(false)}
                  className="text-[13px] font-semibold text-center transition-opacity hover:opacity-70"
                  style={{ color: "rgba(255,255,255,.40)" }}
                >
                  ← Back to Sign In
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-[24px] font-black text-white mb-1" style={{ fontFamily: "'Sora','Inter',sans-serif" }}>
                Sign In
              </h1>
              <p className="text-[13px] mb-8" style={{ color: "rgba(255,255,255,.50)" }}>
                Access your PDS Connect dashboard.
              </p>
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-white">Email Address</label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-white">Password</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={inputStyle}
                  />
                </div>
                {error && (
                  <p className="text-[13px] rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,.12)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,.25)" }}>
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-[12px] text-white font-black text-[15px] disabled:opacity-50 active:scale-[.98] transition-transform flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#2E7FD9,#06B6D4,#14B8A6)", boxShadow: "0 4px 20px rgba(6,182,212,.40)" }}
                >
                  {loading && (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  {loading ? "Signing in..." : "Sign In"}
                </button>
                <button
                  type="button"
                  onClick={() => setResetMode(true)}
                  className="text-[13px] font-semibold text-center transition-opacity hover:opacity-70"
                  style={{ color: "rgba(255,255,255,.45)" }}
                >
                  Forgot your password?
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[13px] mt-6">
          <Link href="/" className="transition-opacity hover:opacity-70" style={{ color: "rgba(255,255,255,.35)" }}>
            ← Back to PDS Connect
          </Link>
        </p>
      </div>
    </div>
  );
}
