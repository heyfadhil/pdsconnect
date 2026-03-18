"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function WhatIsPDS() {
  const ref = useScrollReveal();

  return (
    <section className="bg-white py-24 md:py-32" ref={ref}>
      <div className="max-w-content mx-auto px-5 md:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <p className="reveal label uppercase text-calm-blue tracking-[0.08em] font-semibold mb-4">
              About the Platform
            </p>
            <h2 className="reveal font-display text-heading-1 font-bold text-carbon-black mb-6">
              What Is PDS Connect?
            </h2>
            <p className="reveal text-body-lg text-ink-gray leading-relaxed mb-6 max-w-[60ch]">
              PDS Connect is a structured, event-based business matching
              platform that brings together <strong className="text-carbon-black font-semibold">Buyers</strong> and{" "}
              <strong className="text-carbon-black font-semibold">Sellers</strong> at organised events — making
              meaningful B2B connections effortless and efficient.
            </p>
            <p className="reveal text-body-md text-ink-gray leading-relaxed max-w-[60ch]">
              Unlike generic networking, every interaction on PDS Connect is
              intentional. Admins curate participants, define match criteria, and
              manage the full lifecycle — from invitation to confirmed meeting.
            </p>

            {/* Role pills */}
            <div className="reveal flex gap-4 mt-8">
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-pale-blue-tint border border-light-border">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-xs">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7FD9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-carbon-black">Buyers</p>
                  <p className="text-[12px] text-mid-gray">Browse &amp; request</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-pale-blue-tint border border-light-border">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-xs">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7FD9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M17.5 14v6M14.5 17h6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-carbon-black">Sellers</p>
                  <p className="text-[12px] text-mid-gray">Review &amp; confirm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="reveal relative">
            <div className="relative rounded-2xl bg-pale-blue-tint p-8 border border-light-border">
              {/* Connection diagram */}
              <div className="flex items-center justify-between mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-calm-blue flex items-center justify-center mx-auto mb-3 shadow-md">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-carbon-black">Buyer</p>
                  <p className="text-[11px] text-mid-gray">Company A</p>
                </div>

                {/* Connection line */}
                <div className="flex-1 flex flex-col items-center gap-1 px-4">
                  <div className="w-full h-0.5 bg-gradient-to-r from-calm-blue via-sky-blue to-calm-blue rounded-full" />
                  <span className="text-[10px] font-semibold text-calm-blue uppercase tracking-widest">Match</span>
                  <div className="w-full h-0.5 bg-gradient-to-r from-calm-blue via-sky-blue to-calm-blue rounded-full" />
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-deep-blue flex items-center justify-center mx-auto mb-3 shadow-md">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-carbon-black">Seller</p>
                  <p className="text-[11px] text-mid-gray">Company B</p>
                </div>
              </div>

              {/* Status chips */}
              <div className="flex flex-wrap gap-2">
                {["Request Sent", "Match Confirmed", "Meeting Scheduled"].map(
                  (s, i) => (
                    <span
                      key={s}
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
                      style={{
                        background: i === 2 ? "#2E7FD9" : "#EEF5FC",
                        color: i === 2 ? "#fff" : "#2E7FD9",
                        border: `1px solid ${i === 2 ? "transparent" : "#D8E6F5"}`,
                      }}
                    >
                      {i < 2 ? `✓ ` : ""}{s}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Decorative card */}
            <div className="absolute -bottom-6 -right-6 w-36 h-24 rounded-xl bg-white shadow-lg border border-light-border p-4 hidden md:block">
              <p className="text-[10px] font-semibold text-mid-gray uppercase tracking-wide mb-1">Next Meeting</p>
              <p className="text-sm font-bold text-carbon-black">10:00 AM</p>
              <p className="text-[11px] text-calm-blue font-medium">Table 4 · Hall B</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
