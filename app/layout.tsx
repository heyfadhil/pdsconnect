import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PDS Connect — Business Matching Platform",
  description:
    "PDS Connect facilitates structured meetings between Buyers and Sellers at organised events. Intelligent business matching, effortlessly.",
  keywords: ["business matching", "B2B", "procurement", "networking", "events"],
  openGraph: {
    title: "PDS Connect — Business Matching Platform",
    description:
      "Connecting the right businesses, effortlessly. Join PDS Connect to find your ideal business partners at structured matching events.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sans bg-off-white text-ink-gray antialiased">
        {children}
      </body>
    </html>
  );
}
