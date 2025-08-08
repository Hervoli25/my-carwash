
'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BookingWorkflow } from '@/components/booking/booking-workflow';

export default function BookPage() {

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Book Your Car Wash Service
            </h1>
            <p className="text-lg text-gray-600">
              Complete booking process with license plate tracking and service selection
            </p>
          </div>

          <BookingWorkflow />
        </div>
      </main>
      <Footer />
    </div>
  );
}
