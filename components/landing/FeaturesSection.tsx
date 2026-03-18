"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

const features = [
  {
    title: "Event-Based Matching",
    description:
      "All connections happen within structured, admin-curated events — ensuring every interaction is relevant and purposeful.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: "AI-Powered Assignment",
    description:
      "Gemini AI analyses company profiles and websites to generate relevance scores and summaries — helping admins find the best fits fast.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    title: "Structured Scheduling",
    description:
      "Pre-set time slots and a streamlined negotiation flow ensure meetings are confirmed smoothly — with no back-and-forth confusion.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Admin-Managed Security",
    description:
      "No self-registration. Every participant is vetted and onboarded by the admin team — keeping the platform trusted and high-quality.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Email-Driven Workflow",
    description:
      "Automatic notifications keep both parties informed at every stage — match requests, confirmations, reminders, and meeting details.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    title: "Real-Time Oversight",
    description:
      "Admin dashboards show live match stats, stalled negotiations, and event-wide itineraries — giving full visibility at a glance.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  const ref = useScrollReveal();

  return (
    <section id="features" className="bg-white py-24 md:py-32" ref={ref}>
      <div className="max-w-content mx-auto px-5 md:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="reveal label uppercase text-calm-blue tracking-[0.08em] font-semibold mb-4">
            Why PDS Connect
          </p>
          <h2 className="reveal font-display text-heading-1 font-bold text-carbon-black mb-5">
            Everything You Need for Successful Matching
          </h2>
          <p className="reveal text-body-lg text-ink-gray">
            Purpose-built for structured business events — every feature serves
            a clear role in the matchmaking journey.
          </p>
        </div>

        {/* Cards grid */}
        <div className="reveal-stagger grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="reveal group bg-white rounded-2xl p-8 border border-light-border shadow-sm transition-all duration-base hover:-translate-y-1 hover:shadow-lg hover:border-sky-blue"
            >
              {/* Icon container */}
              <div className="w-12 h-12 rounded-xl bg-pale-blue-tint flex items-center justify-center text-calm-blue mb-5 transition-colors duration-fast group-hover:bg-calm-blue group-hover:text-white">
                {feature.icon}
              </div>

              <h3 className="font-display text-heading-3 font-semibold text-carbon-black mb-3">
                {feature.title}
              </h3>
              <p className="text-body-md text-ink-gray leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
