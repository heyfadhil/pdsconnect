"use client";

import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.2
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    // Observe the element and all children with class "reveal"
    const revealEls = el.classList.contains("reveal")
      ? [el]
      : Array.from(el.querySelectorAll(".reveal"));

    revealEls.forEach((r) => observer.observe(r));

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
