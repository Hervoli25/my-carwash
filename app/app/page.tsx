import { Header } from '@/components/header';
import { HeroSection } from '@/components/sections/hero-section';
import { ServicesSection } from '@/components/sections/services-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { MembershipSection } from '@/components/sections/membership-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <FeaturesSection />
        <MembershipSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}