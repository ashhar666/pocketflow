import { HeroSection } from '@/components/blocks/hero-section-1';
import { SVGFollower } from '@/components/ui/svg-follower';
import { FeatureCardsSection } from '@/components/blocks/feature-cards-section';
import { HowItWorksSimple } from '@/components/blocks/how-it-works-simple';
import { TestimonialsSection } from '@/components/blocks/testimonials-section';
import { FAQSection } from '@/components/blocks/faq-section';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PocketFlow | Smart AI Expense Tracker & Receipt Scanner",
  description: "Stop manual data entry. Use PocketFlow's AI to scan receipts, track spending, and manage your budget in real-time.",
  alternates: {
    canonical: "https://www.pocket-flow.app",
  },
};

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen relative">
      <HeroSection />

      {/* Main Content with Background Interaction */}
      <div className="relative">
        {/* Interactive Overlay (Top Layer but click-through) */}
        <div className="fixed inset-0 pointer-events-none z-[100]">
          <SVGFollower 
            height="100%" 
            colors={["#10b981", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"]} 
            className="w-full h-full opacity-80"
          />
        </div>

        {/* Sections */}
        <div className="relative z-10">
          <FeatureCardsSection />
          <HowItWorksSimple />
          <TestimonialsSection />
          <FAQSection />
        </div>
      </div>
    </main>
  );
}
