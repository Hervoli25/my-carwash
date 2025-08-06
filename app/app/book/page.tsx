
'use client';

import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Car, Clock } from 'lucide-react';

export default function BookPage() {
  const searchParams = useSearchParams();
  const selectedService = searchParams?.get('service');

  const services = [
    { id: 'express', name: 'Express Exterior Wash', price: 'R80' },
    { id: 'premium', name: 'Premium Wash & Wax', price: 'R150' },
    { id: 'deluxe', name: 'Deluxe Interior & Exterior', price: 'R200' },
    { id: 'executive', name: 'Executive Detail Package', price: 'R300' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Book Your Car Wash Service
            </h1>
            <p className="text-lg text-gray-600">
              Schedule your appointment and enjoy our productive waiting lounge
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Service Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="w-5 h-5 mr-2" />
                  Choose Your Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedService === service.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{service.name}</span>
                        <span className="text-lg font-bold text-blue-600">{service.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Select Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Time Slots
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['8:00 AM', '9:30 AM', '11:00 AM', '1:00 PM', '2:30 PM', '4:00 PM'].map((time) => (
                        <button
                          key={time}
                          className="p-2 text-sm border border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Sedan</option>
                      <option>SUV</option>
                      <option>Hatchback</option>
                      <option>Bakkie</option>
                    </select>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 py-3">
                    <Clock className="w-4 h-4 mr-2" />
                    Complete Booking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
