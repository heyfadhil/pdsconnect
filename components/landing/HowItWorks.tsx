"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
  {
    number: "01",
    title: "Register Your Interest",
    description:
      "Submit your company details through our interest form. Our admin team reviews your profile and reaches out to discuss the right fit.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Get Invited to an Event",
    description:
      "Admin creates your account and assigns you to a relevant matching event. You'll receive a welcome email with everything you need to get started.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Match & Meet",
    description:
      "Browse counterpart profiles, request matches, negotiate meeting times, and attend your confirmed meetings — all within one streamlined platform.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const ref = useScrollReveal();

  return (
    <section id="how-it-works" className="bg-off-white py-24 md:py-32" ref={ref}>
      <div className="max-w-content mx-auto px-5 md:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="reveal label uppercase text-calm-blue tracking-[0.08em] font-semibold mb-4">
            Simple Process
          </p>
          <h2 className="reveal font-display text-heading-1 font-bold text-carbon-black mb-5">
            How It Works
          </h2>
          <p className="reveal text-body-lg text-ink-gray">
            From interest to confirmed meeting in three straightforward steps.
          </p>
        </div>

        {/* Steps */}
        <div className="reveal-stagger relative">
          {/* Connector line (desktop) */}
          <div
            className="hidden lg:block absolute top-[52px] left-[calc(16.66%-20px)] right-[calc(16.66%-20px)] h-0.5 bg-gradient-to-r from-light-border via-calm-blue to-light-border"
            aria-hidden="true"
          />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <div key={step.number} className="reveal flex flex-col items-center text-center">
                {/* Step circle */}
                <div className="relative mb-8">
                  <div className="w-[104px] h-[104px] rounded-full bg-white border-2 border-light-border shadow-sm flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-pale-blue-tint flex items-center justify-center text-calm-blue">
                      {step.icon}
                    </div>
                  </div>
                  {/* Number badge */}
                  <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-calm-blue text-white text-[13px] font-bold flex items-center justify-center shadow-md">
                    {i + 1}
                  </span>
                </div>

                <h3 className="font-display text-heading-3 font-semibold text-carbon-black mb-3">
                  {step.title}
                </h3>
                <p className="text-body-md text-ink-gray leading-relaxed max-w-[28ch] mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
