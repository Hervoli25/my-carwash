
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Clock, Car } from 'lucide-react';
import Link from 'next/link';

export default function ExpressServicePage() {
  const features = [
    'Exterior rinse',
    'Soap application',
    'High-pressure wash',
    'Spot-free rinse',
    'Air dry'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Service Details */}
            <div>
              <div className="mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <span>Home</span>
                  <span>›</span>
                  <span>Services</span>
                  <span>›</span>
                  <span>Express Exterior</span>
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Express Exterior Wash
                </h1>
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-3xl font-bold text-blue-600">R80</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.9</span>
                    <span className="text-gray-600">(6,904 reviews)</span>
                  </div>
                </div>

                <p className="text-lg text-gray-600 mb-8">
                  Quick clean for busy lifestyles! Our professional team provides regular maintenance for your vehicle.
                </p>
              </div>

              {/* What's Included */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Process Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Process Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-600 font-bold">1</span>
                      </div>
                      <p className="text-sm text-gray-600">Rinse</p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-600 font-bold">2</span>
                      </div>
                      <p className="text-sm text-gray-600">Apply Soap</p>
                    </div>
                    <div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-600 font-bold">3</span>
                      </div>
                      <p className="text-sm text-gray-600">Wash & Dry</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Panel */}
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    Book This Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date
                      </label>
                      <input
                        type="date"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Times
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM'].map((time) => (
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
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option>Sedan - R80</option>
                        <option>SUV - R90</option>
                        <option>Hatchback - R75</option>
                        <option>Bakkie - R95</option>
                      </select>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Add-ons</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Interior vacuum (+R20)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Tire shine (+R15)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Air freshener (+R10)</span>
                        </label>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium">Total:</span>
                        <span className="text-xl font-bold text-blue-600">R80</span>
                      </div>
                      
                      <div className="space-y-2">
                        <Link href="/book?service=express">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            Book Now
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full">
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
