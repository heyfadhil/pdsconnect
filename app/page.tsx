import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsBar from "@/components/landing/StatsBar";
import WhatIsPDS from "@/components/landing/WhatIsPDS";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesSection from "@/components/landing/FeaturesSection";
import InterestForm from "@/components/landing/InterestForm";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <WhatIsPDS />
        <HowItWorks />
        <FeaturesSection />
        <InterestForm />
      </main>
      <Footer />
    </>
  );
}
