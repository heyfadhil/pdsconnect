import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-carbon-black py-16">
      <div className="max-w-content mx-auto px-5 md:px-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          {/* Brand */}
          <div>
            <Logo variant="dark" showTagline size="md" />
            <p className="mt-4 text-body-sm text-mid-gray max-w-[32ch]">
              Connecting the right businesses, effortlessly.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {[
              { label: "Home", href: "#home" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Features", href: "#features" },
              { label: "Contact", href: "#contact" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[15px] font-medium text-mid-gray transition-colors duration-[150ms] hover:text-electric-cyan"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="h-px mb-8" style={{ background: "rgba(6,182,212,0.15)" }} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-body-sm text-mid-gray">
            &copy; {new Date().getFullYear()} PDS Connect. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-body-sm text-mid-gray hover:text-white transition-colors duration-fast"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-body-sm text-mid-gray hover:text-white transition-colors duration-fast"
            >
              Terms of Use
            </Link>
            <Link
              href="/admin/login"
              className="text-[12px] text-white/20 hover:text-mid-gray transition-colors duration-fast"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
