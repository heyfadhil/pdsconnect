"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 1200, suffix: "+", label: "Businesses Connected" },
  { value: 48, suffix: "+", label: "Events Hosted" },
  { value: 8500, suffix: "+", label: "Matches Made" },
  { value: 94, suffix: "%", label: "Satisfaction Rate" },
];

function useCountUp(target: number, active: boolean, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

function StatItem({ value, suffix, label }: (typeof stats)[0]) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(value, active);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const formatted = count.toLocaleString();

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <p
        className="font-display font-bold text-sky-blue leading-none"
        style={{ fontSize: "clamp(40px, 5vw, 60px)", letterSpacing: "-0.02em" }}
      >
        {formatted}
        {suffix}
      </p>
      <p className="text-label uppercase tracking-[0.08em] text-mid-gray font-semibold">
        {label}
      </p>
    </div>
  );
}

export default function StatsBar() {
  return (
    <section className="bg-carbon-black py-16 md:py-20">
      <div className="max-w-content mx-auto px-5 md:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-0 lg:divide-x lg:divide-white/10">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
