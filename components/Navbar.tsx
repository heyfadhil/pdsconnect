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

  // Close mobile menu on nav click
  const handleNavClick = () => setMobileOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "h-[60px] bg-white/88 backdrop-blur-[16px] saturate-150 shadow-[0_1px_20px_rgba(46,127,217,0.08)]"
            : "h-[72px] bg-transparent"
        }`}
        style={{ backdropFilter: scrolled ? "blur(16px) saturate(1.5)" : "none" }}
      >
        <div className="max-w-content mx-auto h-full px-5 md:px-10 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="PDS Connect Home">
            <Logo variant="light" size="md" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-[15px] font-medium text-ink-gray transition-colors duration-fast hover:text-calm-blue group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-calm-blue rounded-full transition-all duration-fast group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-lg bg-calm-blue text-white text-sm font-semibold transition-all duration-base hover:bg-deep-blue hover:-translate-y-0.5 active:translate-y-0"
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
              className={`block h-0.5 w-6 bg-ink-gray rounded-full transition-all duration-base ${
                mobileOpen ? "rotate-45 translate-y-[7px]" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-ink-gray rounded-full transition-all duration-base ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-ink-gray rounded-full transition-all duration-base ${
                mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-carbon-black flex flex-col items-center justify-center gap-8 transition-all duration-moderate ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={handleNavClick}
            className="text-white text-2xl font-semibold hover:text-sky-blue transition-colors duration-fast"
          >
            {link.label}
          </a>
        ))}
        <Link
          href="/login"
          onClick={handleNavClick}
          className="mt-4 px-8 py-3 rounded-lg bg-calm-blue text-white font-semibold text-lg hover:bg-deep-blue transition-colors duration-base"
        >
          Login
        </Link>
      </div>
    </>
  );
}
