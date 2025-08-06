
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Car, Clock } from 'lucide-react';

export default async function BookingsPage() {
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
            <DashboardSidebar activeTab="bookings" />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600">Manage your car wash appointments</p>
            </div>

            {/* Booking Status Tabs */}
            <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1">
              <Button variant="default" size="sm">All</Button>
              <Button variant="ghost" size="sm">Upcoming</Button>
              <Button variant="ghost" size="sm">Completed</Button>
              <Button variant="ghost" size="sm">Cancelled</Button>
            </div>

            {/* Sample Booking */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      Premium Wash & Wax
                    </CardTitle>
                    <p className="text-gray-600">Booking #12345</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Confirmed</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span>April 25, 2024</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span>10:00 AM</span>
                  </div>
                  <div className="flex items-center">
                    <Car className="w-4 h-4 mr-2 text-gray-500" />
                    <span>Toyota Corolla</span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm" variant="outline">Modify</Button>
                  <Button size="sm" variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Ready to book your next service?</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Calendar className="w-4 h-4 mr-2" />
                Book New Service
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
