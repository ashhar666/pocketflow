import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { HeroSection } from '@/components/blocks/hero-section-1';
import { FeatureCardsSection } from '@/components/blocks/feature-cards-section';
import { HowItWorksSimple } from '@/components/blocks/how-it-works-simple';
import { TestimonialsSection } from '@/components/blocks/testimonials-section';
import { FAQSection } from '@/components/blocks/faq-section';
import { Footer } from '@/components/blocks/footer';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen relative">


      <HeroSection />
      <FeatureCardsSection />
      <HowItWorksSimple />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
