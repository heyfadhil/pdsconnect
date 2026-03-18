import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary blues
        "sky-blue": "#5BABF0",
        "calm-blue": "#2E7FD9",
        "deep-blue": "#1A5FAA",
        // Teal & Cyan expansion (v2.0)
        "electric-cyan": "#00D4FF",
        "vivid-cyan": "#06B6D4",
        "teal": "#14B8A6",
        "deep-teal": "#0D9488",
        "cyan-tint": "#ECFEFF",
        // Neutrals
        "off-white": "#F5F8FC",
        "carbon-black": "#0D0D0D",
        "ink-gray": "#3A3A3A",
        "mid-gray": "#8A8A8A",
        "light-border": "#D8E6F5",
        "pale-blue-tint": "#EEF5FC",
        // Hero dark
        "navy": "#0A1628",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "DM Sans", "sans-serif"],
        display: ["var(--font-sora)", "Sora", "Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "display-xl": ["72px", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-lg": ["56px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "heading-1": ["40px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "heading-2": ["32px", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        "heading-3": ["24px", { lineHeight: "1.3", letterSpacing: "0" }],
        "heading-4": ["20px", { lineHeight: "1.4", letterSpacing: "0" }],
        "body-lg": ["18px", { lineHeight: "1.6", letterSpacing: "0" }],
        "body-md": ["16px", { lineHeight: "1.65", letterSpacing: "0" }],
        "body-sm": ["14px", { lineHeight: "1.6", letterSpacing: "0.01em" }],
        label: ["12px", { lineHeight: "1.4", letterSpacing: "0.08em" }],
      },
      boxShadow: {
        xs: "0 1px 4px rgba(46,127,217,0.04)",
        sm: "0 2px 12px rgba(6,182,212,0.06)",
        md: "0 4px 20px rgba(6,182,212,0.10)",
        lg: "0 8px 32px rgba(6,182,212,0.18)",
        xl: "0 16px 48px rgba(6,182,212,0.22)",
        glow: "0 0 24px rgba(91,171,240,0.30)",
        "glow-cyan": "0 0 32px rgba(0,212,255,0.35)",
        "glow-teal": "0 0 20px rgba(20,184,166,0.30)",
      },
      animation: {
        "float": "float 5s ease-in-out infinite",
        "counter": "counter 1.0s ease-out forwards",
        "fade-rise": "fadeRise 0.5s ease-out forwards",
        "shimmer": "shimmer 1.2s infinite",
        "orb-drift": "orbDrift 30s ease-in-out infinite",
        "spring-press": "springPress 200ms cubic-bezier(0.34,1.56,0.64,1)",
        "pulse-glow": "pulseGlow 400ms ease-out forwards",
        "ripple": "rippleExpand 500ms ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeRise: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        orbDrift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 15px) scale(0.95)" },
        },
        springPress: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(0.96)" },
          "70%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)" },
        },
        pulseGlow: {
          "0%": { boxShadow: "0 0 0 rgba(0,212,255,0)" },
          "50%": { boxShadow: "0 0 24px rgba(0,212,255,0.40)" },
          "100%": { boxShadow: "0 0 0 rgba(0,212,255,0)" },
        },
        rippleExpand: {
          "to": { transform: "scale(4)", opacity: "0" },
        },
      },
      transitionDuration: {
        "instant": "100ms",
        "fast": "150ms",
        "base": "250ms",
        "moderate": "400ms",
        "slow": "600ms",
        "reveal": "800ms",
      },
      maxWidth: {
        content: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
