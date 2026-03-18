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
    } else {
      await supabase.auth.signOut();
      setError("This login is for Buyers and Sellers. Admin staff should use the admin portal.");
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

  const inputClass =
    "w-full h-12 px-4 rounded-lg border-[1.5px] border-light-border bg-white text-ink-gray placeholder:text-mid-gray transition-all duration-fast focus:outline-none focus:border-calm-blue focus:shadow-[0_0_0_3px_rgba(46,127,217,0.15)]";

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10">
          <Link href="/">
            <Logo variant="light" showTagline size="lg" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-light-border shadow-md p-8">
          {resetSent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-pale-blue-tint flex items-center justify-center mx-auto mb-5">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2E7FD9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="font-display text-heading-3 font-bold text-carbon-black mb-2">Check Your Email</h2>
              <p className="text-body-sm text-ink-gray mb-6">We've sent a password reset link to <strong>{email}</strong>.</p>
              <button onClick={() => { setResetMode(false); setResetSent(false); }} className="text-calm-blue text-sm font-semibold hover:text-deep-blue transition-colors">← Back to Sign In</button>
            </div>
          ) : resetMode ? (
            <>
              <h1 className="font-display text-heading-2 font-bold text-carbon-black mb-1">Forgot Password</h1>
              <p className="text-body-sm text-mid-gray mb-8">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleReset} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[14px] font-semibold text-carbon-black mb-1.5">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
                <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-calm-blue text-white font-semibold transition-all duration-base hover:bg-deep-blue disabled:opacity-60">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <button type="button" onClick={() => setResetMode(false)} className="text-mid-gray text-sm hover:text-ink-gray transition-colors text-center">← Back to Sign In</button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-display text-heading-2 font-bold text-carbon-black mb-1">Sign In</h1>
              <p className="text-body-sm text-mid-gray mb-8">Access your PDS Connect dashboard.</p>
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[14px] font-semibold text-carbon-black mb-1.5">Email Address</label>
                  <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-carbon-black mb-1.5">Password</label>
                  <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
                <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-calm-blue text-white font-semibold transition-all duration-base hover:bg-deep-blue hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60">
                  {loading ? (
                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Signing in...</>
                  ) : "Sign In"}
                </button>
                <button type="button" onClick={() => setResetMode(true)} className="text-calm-blue text-sm font-semibold hover:text-deep-blue transition-colors text-center">Forgot your password?</button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-body-sm text-mid-gray mt-6">
          <Link href="/" className="hover:text-calm-blue transition-colors duration-fast">← Back to PDS Connect</Link>
        </p>
      </div>
    </div>
  );
}
