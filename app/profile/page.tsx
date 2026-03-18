"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import UserNav from "@/components/user/UserNav";
import { Save, Lock, Building2, Tag } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  email: string;
  company_name: string;
  role: "buyer" | "seller";
  bio?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  tags?: string | null;
  industries?: { name: string } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [bio, setBio] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdError, setPwdError] = useState("");

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        const p = d.profile as Profile;
        setProfile(p);
        setBio(p.bio ?? "");
        setLogoUrl(p.logo_url ?? "");
        setWebsiteUrl(p.website_url ?? "");
      })
      .catch(() => router.push("/login"));
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, logo_url: logoUrl, website_url: websiteUrl }),
    });
    setSaving(false);
    if (res.ok) {
      setSaveMsg("Profile saved.");
      setTimeout(() => setSaveMsg(""), 3000);
    } else {
      setSaveMsg("Failed to save.");
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdError("");
    setPwdMsg("");
    if (newPassword !== confirmPassword) {
      setPwdError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwdError("Password must be at least 8 characters.");
      return;
    }
    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwdLoading(false);
    if (error) {
      setPwdError(error.message);
    } else {
      setPwdMsg("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwdMsg(""), 3000);
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center text-mid-gray">
        Loading…
      </div>
    );
  }

  const tags = (profile.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-off-white">
      <UserNav userName={profile.name} userRole={profile.role} />
      <main className="max-w-content mx-auto px-6 py-8">
        <div className="max-w-2xl flex flex-col gap-8">
          <div>
            <h1 className="font-display font-bold text-heading-2 text-ink-gray">Edit Profile</h1>
            <p className="text-body-md text-mid-gray mt-1">
              Update your company bio, logo, and website URL.
            </p>
          </div>

          {/* Read-only info */}
          <div className="bg-white rounded-2xl border border-light-border p-6 flex flex-col gap-4">
            <h2 className="font-display font-semibold text-heading-4 text-ink-gray">
              Company Info
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <ReadOnlyField label="Company Name" value={profile.company_name} />
              <ReadOnlyField label="Email" value={profile.email} />
              <ReadOnlyField label="Role" value={profile.role === "buyer" ? "Buyer" : "Seller"} />
            </div>

            {/* Admin-managed fields */}
            <div className="border-t border-light-border pt-4 flex flex-col gap-3">
              <p className="text-body-sm text-mid-gray flex items-center gap-1.5">
                <Building2 size={13} className="text-calm-blue" />
                Industry:{" "}
                <span className="font-medium text-ink-gray">
                  {profile.industries?.name ?? "Not assigned"}
                </span>
                <span className="ml-1 text-label text-mid-gray">(admin-managed)</span>
              </p>
              {tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={13} className="text-calm-blue shrink-0" />
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-off-white border border-light-border text-body-sm text-ink-gray rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                  <span className="text-label text-mid-gray">(admin-managed)</span>
                </div>
              )}
            </div>
          </div>

          {/* Editable fields */}
          <form
            onSubmit={saveProfile}
            className="bg-white rounded-2xl border border-light-border p-6 flex flex-col gap-5"
          >
            <h2 className="font-display font-semibold text-heading-4 text-ink-gray">
              Editable Fields
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-body-sm font-medium text-ink-gray">Website URL</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourcompany.com"
                className="border border-light-border rounded-xl px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-calm-blue"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-body-sm font-medium text-ink-gray">Logo URL</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://yourcompany.com/logo.png"
                className="border border-light-border rounded-xl px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-calm-blue"
              />
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="mt-1 h-14 w-auto object-contain rounded-lg border border-light-border"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-body-sm font-medium text-ink-gray">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Describe your company, what you do, and what you're looking for…"
                className="border border-light-border rounded-xl px-4 py-2.5 text-body-sm resize-none focus:outline-none focus:ring-2 focus:ring-calm-blue"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-calm-blue text-white text-body-sm font-medium hover:bg-deep-blue disabled:opacity-50 transition-colors"
              >
                <Save size={14} />
                {saving ? "Saving…" : "Save Changes"}
              </button>
              {saveMsg && (
                <span
                  className={`text-body-sm font-medium ${saveMsg.includes("Failed") ? "text-red-600" : "text-emerald-600"}`}
                >
                  {saveMsg}
                </span>
              )}
            </div>
          </form>

          {/* Change Password */}
          <form
            onSubmit={changePassword}
            className="bg-white rounded-2xl border border-light-border p-6 flex flex-col gap-5"
          >
            <h2 className="font-display font-semibold text-heading-4 text-ink-gray flex items-center gap-2">
              <Lock size={16} className="text-calm-blue" />
              Change Password
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-body-sm font-medium text-ink-gray">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="border border-light-border rounded-xl px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-calm-blue"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-body-sm font-medium text-ink-gray">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="border border-light-border rounded-xl px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-calm-blue"
              />
            </div>

            {pwdError && (
              <p className="text-body-sm text-red-600 font-medium">{pwdError}</p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={pwdLoading || !newPassword || !confirmPassword}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-calm-blue text-white text-body-sm font-medium hover:bg-deep-blue disabled:opacity-50 transition-colors"
              >
                <Lock size={14} />
                {pwdLoading ? "Updating…" : "Update Password"}
              </button>
              {pwdMsg && (
                <span className="text-body-sm font-medium text-emerald-600">{pwdMsg}</span>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label font-semibold text-mid-gray uppercase tracking-wider">
        {label}
      </span>
      <span className="text-body-sm text-ink-gray font-medium">{value}</span>
    </div>
  );
}
