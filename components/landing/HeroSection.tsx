"use client";

import { useEffect, useRef } from "react";

export default function HeroSection() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = [
      { el: badgeRef.current, delay: 0 },
      { el: headingRef.current, delay: 100 },
      { el: subRef.current, delay: 200 },
      { el: ctaRef.current, delay: 320 },
    ];
    elements.forEach(({ el, delay }) => {
      if (!el) return;
      setTimeout(() => el.classList.add("visible"), delay + 80);
    });
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center overflow-hidden"
      style={{ background: "#0A1628" }}
    >
      {/* Aurora mesh gradient orbs */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 20% 50%, rgba(6,182,212,0.18) 0%, transparent 60%), " +
            "radial-gradient(ellipse 60% 50% at 80% 20%, rgba(46,127,217,0.22) 0%, transparent 60%), " +
            "radial-gradient(ellipse 50% 40% at 60% 80%, rgba(20,184,166,0.15) 0%, transparent 60%)",
        }}
      />

      {/* Animated slow-drifting orb */}
      <div
        className="absolute pointer-events-none animate-orb-drift"
        aria-hidden="true"
        style={{
          top: "10%",
          right: "15%",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          bottom: "5%",
          left: "10%",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20,184,166,0.10) 0%, transparent 70%)",
          filter: "blur(32px)",
          animationDelay: "-12s",
        }}
      />

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-content mx-auto w-full px-5 md:px-10 py-36 lg:py-44">
        <div className="max-w-3xl">
          {/* Announcement badge */}
          <div
            ref={badgeRef}
            className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.25)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#14B8A6",
                boxShadow: "0 0 6px #14B8A6",
                animation: "opacity 2s infinite",
              }}
            />
            <span
              className="text-[12px] font-bold tracking-[0.08em] uppercase"
              style={{ color: "#00D4FF" }}
            >
              Business Matching Platform
            </span>
          </div>

          {/* Headline */}
          <h1
            ref={headingRef}
            className="reveal font-display font-bold text-white mb-6"
            style={{
              fontSize: "clamp(42px, 6vw, 72px)",
              lineHeight: "1.05",
              letterSpacing: "-0.03em",
            }}
          >
            Connect with the{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 50%, #14B8A6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Right Partners
            </span>
            <br />
            at Every Event
          </h1>

          {/* Subheadline */}
          <p
            ref={subRef}
            className="reveal text-[clamp(16px,2vw,18px)] leading-relaxed max-w-xl mb-12"
            style={{ color: "rgba(255,255,255,0.72)" }}
          >
            PDS Connect facilitates structured meetings between Buyers and
            Sellers at organised events — driven by intelligent matching,
            built on trust.
          </p>

          {/* CTA group */}
          <div ref={ctaRef} className="reveal flex flex-wrap gap-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-white font-semibold text-[15px] transition-all duration-[150ms] hover:-translate-y-[3px] hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 50%, #14B8A6 100%)",
                boxShadow: "0 4px 20px rgba(6,182,212,0.35)",
                transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(6,182,212,0.50)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(6,182,212,0.35)";
              }}
            >
              Get Started
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-[150ms] group-hover:translate-x-1.5" style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-[15px] transition-all duration-200"
              style={{
                border: "1.5px solid rgba(255,255,255,0.40)",
                color: "#FFFFFF",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#06B6D4";
                el.style.color = "#06B6D4";
                el.style.background = "rgba(6,182,212,0.08)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(255,255,255,0.40)";
                el.style.color = "#FFFFFF";
                el.style.background = "transparent";
              }}
            >
              How It Works
            </a>
          </div>
        </div>

        {/* Floating glass card — desktop only */}
        <div className="hidden lg:block absolute right-8 xl:right-16 top-1/2 -translate-y-1/2">
          <div
            className="w-72 xl:w-80 rounded-2xl overflow-hidden"
            style={{
              animation: "float 5s ease-in-out infinite",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px) saturate(1.3)",
              border: "1px solid rgba(0,212,255,0.20)",
              boxShadow: "0 0 40px rgba(0,212,255,0.15), 0 16px 48px rgba(6,182,212,0.20)",
            }}
          >
            {/* Accent bar */}
            <div
              className="h-1"
              style={{ background: "linear-gradient(90deg, #2E7FD9, #06B6D4, #14B8A6)" }}
            />
            <div className="p-6">
              {/* Mock match card */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)", border: "2px solid #06B6D4" }}
                >
                  A
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Acme Corp</p>
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide"
                    style={{ background: "rgba(6,182,212,0.15)", color: "#06B6D4" }}
                  >
                    Technology
                  </span>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.50)" }}>Match</p>
                  <p
                    className="text-xl font-bold"
                    style={{
                      background: "linear-gradient(135deg, #2E7FD9, #06B6D4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    92%
                  </p>
                </div>
              </div>
              <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.08)" }} />
              <p className="text-[13px] mb-4 line-clamp-2" style={{ color: "rgba(255,255,255,0.60)" }}>
                Leading technology solutions provider specialising in enterprise software.
              </p>
              <button
                className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-all duration-[150ms]"
                style={{
                  background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)",
                  boxShadow: "0 4px 16px rgba(6,182,212,0.30)",
                }}
              >
                Request Match
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #F5F8FC)" }}
      />
    </section>
  );
}
