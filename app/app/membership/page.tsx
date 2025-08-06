
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MembershipSection } from '@/components/sections/membership-section';

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Membership Plans
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our membership program and save on every wash while enjoying exclusive benefits
              and priority booking access.
            </p>
          </div>
        </div>
        <MembershipSection />
      </main>
      <Footer />
    </div>
  );
}
