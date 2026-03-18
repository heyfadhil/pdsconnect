"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function HeroSection() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = [
      { el: headingRef.current, delay: 0 },
      { el: subRef.current, delay: 100 },
      { el: ctaRef.current, delay: 200 },
    ];
    elements.forEach(({ el, delay }) => {
      if (!el) return;
      setTimeout(() => el.classList.add("visible"), delay + 100);
    });
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-[90vh] flex items-center overflow-hidden bg-calm-blue"
    >
      {/* Background mesh gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(91,171,240,0.25) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(26,95,170,0.4) 0%, transparent 60%)",
        }}
      />

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-content mx-auto w-full px-5 md:px-10 py-32 lg:py-40">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-sky-blue animate-pulse" />
            Business Matching Platform
          </div>

          {/* Headline */}
          <h1
            ref={headingRef}
            className="reveal font-display text-[clamp(40px,6vw,72px)] font-bold text-white leading-[1.05] tracking-[-0.03em] mb-6"
          >
            Connect with the{" "}
            <span className="text-sky-blue">Right Partners</span>
            <br />
            at Every Event
          </h1>

          {/* Subheadline */}
          <p
            ref={subRef}
            className="reveal text-[clamp(16px,2vw,18px)] text-white/80 leading-relaxed max-w-xl mb-10"
          >
            PDS Connect facilitates structured meetings between Buyers and
            Procurers at organised events — driven by intelligent matching,
            built on trust.
          </p>

          {/* CTA group */}
          <div ref={ctaRef} className="reveal flex flex-wrap gap-3">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-white text-calm-blue font-semibold text-[15px] transition-all duration-base hover:bg-off-white hover:-translate-y-0.5 active:translate-y-0 shadow-lg"
            >
              Get Started
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border-[1.5px] border-white/60 text-white font-semibold text-[15px] transition-all duration-base hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0"
            >
              How It Works
            </a>
          </div>
        </div>

        {/* Floating visual card */}
        <div className="hidden lg:block absolute right-10 xl:right-20 top-1/2 -translate-y-1/2">
          <div
            className="w-72 xl:w-80 rounded-2xl overflow-hidden shadow-xl"
            style={{ animation: "float 4s ease-in-out infinite" }}
          >
            <div className="bg-white p-6">
              {/* Mock match card */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-pale-blue-tint flex items-center justify-center text-calm-blue font-bold text-lg">
                  A
                </div>
                <div>
                  <p className="font-semibold text-carbon-black text-sm">Acme Corp</p>
                  <span className="inline-block px-2 py-0.5 rounded bg-pale-blue-tint text-calm-blue text-[11px] font-semibold tracking-wide">
                    Technology
                  </span>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[11px] text-mid-gray font-medium">Match</p>
                  <p className="text-xl font-bold text-calm-blue">92%</p>
                </div>
              </div>
              <div className="h-px bg-light-border mb-4" />
              <p className="text-body-sm text-ink-gray mb-4 line-clamp-2">
                Leading technology solutions provider specialising in enterprise software.
              </p>
              <button className="w-full py-2.5 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors">
                Request Match
              </button>
            </div>
            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-calm-blue to-sky-blue" style={{ order: -1, position: "absolute", top: 0, left: 0, right: 0 }} />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #F5F8FC)" }}
      />
    </section>
  );
}
