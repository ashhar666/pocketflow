import { HeroSection } from '@/components/blocks/hero-section-1';
import { ProcessSection } from '@/components/blocks/process-section';
import { FeaturesSection } from '@/components/blocks/features-section';

import { FAQSection } from '@/components/blocks/faq-section';
import { CTASection } from '@/components/blocks/cta-section';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <HeroSection />
        <ProcessSection />
        <FeaturesSection />

        <FAQSection />
        <CTASection />
      </div>
    </main>
  );
}
