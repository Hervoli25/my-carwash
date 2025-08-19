
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react';

export default async function SupportPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <DashboardSidebar activeTab="support" />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Support</h1>
              <p className="text-gray-600">Get help with your account and services</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Options */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Phone className="w-5 h-5 mr-2" />
                      Phone Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Call us for immediate assistance</p>
                    <p className="font-medium text-lg">+27 123 456 789</p>
                    <p className="text-sm text-gray-600">Mon-Fri: 8AM-6PM, Sat: 8AM-5PM, Sun: 9AM-2PM</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Email Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Send us an email and we'll get back to you</p>
                    <p className="font-medium">info@ekhayaintel.co.za</p>
                    <p className="text-sm text-gray-600">Response within 24 hours</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <HelpCircle className="w-5 h-5 mr-2" />
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {/* Booking Management */}
                      <details className="group border-b border-gray-100 pb-3">
                        <summary className="font-medium cursor-pointer text-blue-700 hover:text-blue-800 flex items-center">
                          📅 How do I modify my booking?
                        </summary>
                        <div className="text-sm text-gray-600 mt-3 ml-4 space-y-2">
                          <p><strong>Online Modifications:</strong> You can modify your booking up to 24 hours before your scheduled time through your dashboard.</p>
                          <p><strong>What you can change:</strong> Date, time, service type, add-ons, special instructions</p>
                          <p><strong>Within 24 hours:</strong> Please call us at <a href="tel:+27786132969" className="text-blue-600 hover:underline">+27 78 613 2969</a> for assistance</p>
                          <p><strong>Same-day changes:</strong> Subject to availability and may incur additional charges</p>
                        </div>
                      </details>

                      <details className="group border-b border-gray-100 pb-3">
                        <summary className="font-medium cursor-pointer text-blue-700 hover:text-blue-800">
                          ❌ What is your cancellation policy?
                        </summary>
                        <div className="text-sm text-gray-600 mt-3 ml-4 space-y-2">
                          <p><strong>Free Cancellation:</strong> Cancel up to 24 hours before your scheduled time for full refund</p>
                          <p><strong>Late Cancellation:</strong> Within 24 hours - please call the car wash at <a href="tel:+27786132969" className="text-blue-600 hover:underline">+27 78 613 2969</a></p>
                          <p><strong>No-Show Policy:</strong> Full charge applies for missed appointments without 24-hour notice</p>
                          <p><strong>Emergency Situations:</strong> We understand emergencies happen - please call to discuss options</p>
                        </div>
                      </details>

                      {/* Business Hours & Scheduling */}
                      <details className="group border-b border-gray-100 pb-3">
                        <summary className="font-medium cursor-pointer text-blue-700 hover:text-blue-800">
                          🕐 What are your business hours?
                        </summary>
                        <div className="text-sm text-gray-600 mt-3 ml-4 space-y-2">
                          <p><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM</p>
                          <p><strong>Saturday:</strong> 8:00 AM - 5:00 PM</p>
                          <p><strong>Sunday:</strong> 9:00 AM - 2:00 PM (Early closure for staff rest)</p>
                          <p><strong>Public Holidays:</strong> Closed (Check our calendar for specific dates)</p>
                          <p><strong>Capacity:</strong> 5-10 customers per time slot based on demand</p>
                        </div>
                      </details>

                      {/* Services & Pricing */}
                      <details className="group border-b border-gray-100 pb-3">
                        <summary className="font-medium cursor-pointer text-blue-700 hover:text-blue-800">
                          💰 What services do you offer and pricing?
                        </summary>
                        <div className="text-sm text-gray-600 mt-3 ml-4 space-y-2">
                          <p><strong>Express Exterior Wash (15 min):</strong> R80 - Basic exterior wash and dry</p>
                          <p><strong>Premium Wash & Wax (30 min):</strong> R150 - Exterior wash, wax, tire shine</p>
                          <p><strong>Deluxe Interior & Exterior (60 min):</strong> R200 - Full interior vacuum, exterior detailing</p>
                          <p><strong>Executive Detail Package (120 min):</strong> R300 - Premium comprehensive detailing</p>
                          <p><strong>Add-ons:</strong> Tire shine (+R25), Air freshener (+R15), Dashboard treatment (+R35), Floor mats (+R50), Engine bay (+R75)</p>
                        </div>
                      </details>

                      {/* Booking System */}
                      <details className="group border-b border-gray-100 pb-3">
                        <summary className="font-medium cursor-pointer text-blue-700 hover:text-blue-800">
                          📱 How does online booking work?
                        </summary>
                        <div className="text-sm text-gray-600 mt-3 ml-4 space-y-2">
                          <p><strong>Account Required:</strong> Must register/sign in to make bookings (saves your vehicles & history)</p>
                          <p><strong>Real-time Availability:</strong> See live slot availability and remaining capacity</p>
                          <p><strong>Smart Suggestions:</strong> Get service recommendations based on your history</p>
                          <p><strong>Capacity Management:</strong> Each slot accommodates 5-10 people - when full, system suggests next hour</p>
                          <p><strong>Confirmations:</strong> Receive email and SMS notifications</p>
                        </div>
                      </details>

                      {/* Payment */}
                      <details className="group border-b border-gray-100 pb-3">
                        <summary className="font-medium cursor-pointer text-blue-700 hover:text-blue-800">
                          💳 What payment methods are accepted?
                        </summary>
                        <div className="text-sm text-gray-600 mt-3 ml-4 space-y-2">
                          <p><strong>Pay at Location:</strong> Cash, Card, Mobile payments (Recommended)</p>
                          <p><strong>Online Payment:</strong> PayFast secure payment gateway</p>
                          <p><strong>Bank Transfer:</strong> EFT payments accepted</p>
                          <p><strong>Membership Benefits:</strong> Premium members get exclusive discounts</p>
                        </div>
                      </details>

                      {/* Vehicle Requirements */}
                      <details className="group border-b border-gray-100 pb-3">
                        <summary className="font-medium cursor-pointer text-blue-700 hover:text-blue-800">
                          🚗 Why do you need my license plate number?
                        </summary>
                        <div className="text-sm text-gray-600 mt-3 ml-4 space-y-2">
                          <p><strong>Mandatory Requirement:</strong> License plates required for all bookings</p>
                          <p><strong>Vehicle Tracking:</strong> Ensures proper service tracking and quality assurance</p>
                          <p><strong>Service History:</strong> Maintains records for better service recommendations</p>
                          <p><strong>Multiple Vehicles:</strong> Save multiple vehicles to your account for easy rebooking</p>
                        </div>
                      </details>

                      {/* Quality Assurance */}
                      <details className="group border-b border-gray-100 pb-3">
                        <summary className="font-medium cursor-pointer text-blue-700 hover:text-blue-800">
                          ⭐ What if I'm not satisfied with service?
                        </summary>
                        <div className="text-sm text-gray-600 mt-3 ml-4 space-y-2">
                          <p><strong>Quality Guarantee:</strong> We stand behind all our work</p>
                          <p><strong>Immediate Resolution:</strong> Speak to manager on-site for instant help</p>
                          <p><strong>24-Hour Policy:</strong> Contact us within 24 hours for service issues</p>
                          <p><strong>Solutions:</strong> Free re-service, partial refund, or service credit available</p>
                        </div>
                      </details>

                      {/* Weather & Operations */}
                      <details className="group">
                        <summary className="font-medium cursor-pointer text-blue-700 hover:text-blue-800">
                          🌧️ Do you operate in all weather conditions?
                        </summary>
                        <div className="text-sm text-gray-600 mt-3 ml-4 space-y-2">
                          <p><strong>All-Weather Service:</strong> We operate rain or shine with covered facilities</p>
                          <p><strong>Weather Recommendations:</strong> Interior services suggested on rainy days</p>
                          <p><strong>Severe Weather:</strong> Free rescheduling for extreme weather conditions</p>
                          <p><strong>Seasonal Services:</strong> Special winter and summer service packages available</p>
                        </div>
                      </details>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option>Booking Issue</option>
                        <option>Payment Problem</option>
                        <option>Service Quality</option>
                        <option>Technical Support</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        placeholder="Describe your issue or question..."
                      ></textarea>
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
