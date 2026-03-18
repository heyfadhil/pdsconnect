"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = () => setMobileOpen(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-[250ms]"
        style={{
          height: scrolled ? "60px" : "72px",
          background: scrolled ? "rgba(255,255,255,0.90)" : "rgba(10,22,40,0.15)",
          backdropFilter: scrolled ? "blur(20px) saturate(1.6)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.6)" : "none",
          boxShadow: scrolled ? "0 1px 32px rgba(6,182,212,0.12)" : "none",
        }}
      >
        <div className="max-w-content mx-auto h-full px-5 md:px-10 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="PDS Connect Home" className="transition-transform duration-200 hover:scale-[1.03]" style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}>
            <Logo variant={scrolled ? "light" : "dark"} size="md" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-[15px] font-medium transition-all duration-[150ms] group"
                style={{ color: scrolled ? "#3A3A3A" : "rgba(255,255,255,0.85)" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = "#06B6D4";
                  el.style.textShadow = "0 0 12px rgba(0,212,255,0.40)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = scrolled ? "#3A3A3A" : "rgba(255,255,255,0.85)";
                  el.style.textShadow = "";
                }}
              >
                {link.label}
                <span
                  className="absolute -bottom-0.5 left-0 h-0.5 w-0 rounded-full transition-all duration-[150ms] group-hover:w-full"
                  style={{ background: "#06B6D4" }}
                />
              </a>
            ))}
          </nav>

          {/* Desktop CTA — Cyan button */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-all duration-[150ms] hover:-translate-y-[3px]"
              style={{
                background: "#06B6D4",
                boxShadow: "0 4px 14px rgba(6,182,212,0.30)",
                transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "#0D9488";
                el.style.boxShadow = "0 8px 24px rgba(6,182,212,0.45)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "#06B6D4";
                el.style.boxShadow = "0 4px 14px rgba(6,182,212,0.30)";
              }}
            >
              Login
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span
              className={`block h-0.5 w-6 rounded-full transition-all duration-[250ms] ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`}
              style={{ background: scrolled ? "#3A3A3A" : "#FFFFFF" }}
            />
            <span
              className={`block h-0.5 w-6 rounded-full transition-all duration-[250ms] ${mobileOpen ? "opacity-0" : ""}`}
              style={{ background: scrolled ? "#3A3A3A" : "#FFFFFF" }}
            />
            <span
              className={`block h-0.5 w-6 rounded-full transition-all duration-[250ms] ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
              style={{ background: scrolled ? "#3A3A3A" : "#FFFFFF" }}
            />
          </button>
        </div>
      </header>

      {/* Mobile overlay — aurora gradient */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 transition-all duration-[350ms] ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: "#0A1628",
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 30% 40%, rgba(6,182,212,0.15) 0%, transparent 60%), " +
            "radial-gradient(ellipse 50% 40% at 70% 70%, rgba(20,184,166,0.12) 0%, transparent 60%)",
        }}
      >
        {navLinks.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            onClick={handleNavClick}
            className="text-white text-2xl font-semibold transition-all duration-[150ms] hover:text-vivid-cyan"
            style={{
              transitionDelay: mobileOpen ? `${i * 60}ms` : "0ms",
              transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#06B6D4";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
            }}
          >
            {link.label}
          </a>
        ))}
        <Link
          href="/login"
          onClick={handleNavClick}
          className="mt-4 px-8 py-3 rounded-lg text-white font-semibold text-lg transition-all duration-[150ms]"
          style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)" }}
        >
          Login
        </Link>
      </div>
    </>
  );
}
