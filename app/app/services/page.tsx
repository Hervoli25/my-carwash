
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ServicesSection } from '@/components/sections/services-section';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Our Car Wash Services
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional car care services designed to keep your vehicle looking its best.
              From quick express washes to comprehensive detailing packages.
            </p>
          </div>
        </div>
        <ServicesSection />
      </main>
      <Footer />
    </div>
  );
}
