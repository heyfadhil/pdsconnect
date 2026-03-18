"use client";

import { X, Globe, Tag, Building2 } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  company_name: string;
  bio?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  tags?: string | null;
  industries?: { name: string } | null;
  already_requested?: boolean;
}

interface Props {
  profile: Profile | null;
  onClose: () => void;
  onRequestMatch: (id: string) => void;
  matchCapReached: boolean;
}

export default function ProfileDrawer({
  profile,
  onClose,
  onRequestMatch,
  matchCapReached,
}: Props) {
  if (!profile) return null;

  const tags = (profile.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border">
          <h2 className="font-display font-semibold text-heading-4 text-ink-gray">
            Company Profile
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-pale-blue-tint text-mid-gray"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Logo + name */}
          <div className="flex items-center gap-4">
            {profile.logo_url ? (
              <img
                src={profile.logo_url}
                alt={profile.company_name}
                className="w-16 h-16 rounded-xl object-contain border border-light-border bg-off-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-pale-blue-tint flex items-center justify-center text-calm-blue font-display font-bold text-xl">
                {profile.company_name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-display font-bold text-heading-3 text-ink-gray leading-snug">
                {profile.company_name}
              </h3>
              {profile.industries?.name && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-calm-blue/10 text-calm-blue text-label font-semibold rounded-full uppercase tracking-wide">
                  {profile.industries.name}
                </span>
              )}
            </div>
          </div>

          {/* Website */}
          {profile.website_url && (
            <a
              href={profile.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-body-sm text-calm-blue hover:underline"
            >
              <Globe size={13} />
              {profile.website_url.replace(/^https?:\/\//, "")}
            </a>
          )}

          {/* Industry */}
          {profile.industries?.name && (
            <div className="flex items-center gap-2 text-body-sm text-mid-gray">
              <Building2 size={13} />
              {profile.industries.name}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-label font-semibold text-mid-gray uppercase tracking-wider">
                <Tag size={11} />
                Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 bg-off-white border border-light-border text-body-sm text-ink-gray rounded-full"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div>
              <p className="text-label font-semibold text-mid-gray uppercase tracking-wider mb-2">
                About
              </p>
              <p className="text-body-sm text-ink-gray leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            </div>
          )}
        </div>

        {/* Footer action */}
        <div className="px-6 py-4 border-t border-light-border">
          {profile.already_requested ? (
            <button
              disabled
              className="w-full py-3 rounded-xl bg-mid-gray/20 text-mid-gray font-semibold text-body-md cursor-not-allowed"
            >
              Already Requested
            </button>
          ) : matchCapReached ? (
            <button
              disabled
              className="w-full py-3 rounded-xl bg-mid-gray/20 text-mid-gray font-semibold text-body-md cursor-not-allowed"
            >
              Match Limit Reached
            </button>
          ) : (
            <button
              onClick={() => onRequestMatch(profile.id)}
              className="w-full py-3 rounded-xl bg-calm-blue text-white font-semibold text-body-md hover:bg-deep-blue transition-colors"
            >
              Request Match
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
