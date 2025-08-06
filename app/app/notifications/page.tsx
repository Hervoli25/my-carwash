
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Gift, CheckCircle } from 'lucide-react';

export default async function NotificationsPage() {
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
            <DashboardSidebar activeTab="notifications" />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">Stay updated with your bookings and promotions</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Notifications</span>
                  <Badge variant="outline">4 new</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Booking Notification */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Premium Wash</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Your booking for Apr 25, 2024 at 10:00 AM is confirmed.
                        </p>
                        <p className="text-xs text-gray-500 mt-2">2 hours ago</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">Booking</Badge>
                    </div>
                  </div>

                  {/* System Notification */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Update on account settings updated</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Your account settings have been successfully updated.
                        </p>
                        <p className="text-xs text-gray-500 mt-2">1 day ago</p>
                      </div>
                      <Badge variant="outline">System</Badge>
                    </div>
                  </div>

                  {/* Promotion Notification */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Gift className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Special promotion</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Get 20% off your next premium service!
                        </p>
                        <p className="text-xs text-gray-500 mt-2">2 days ago</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Promotion</Badge>
                    </div>
                  </div>

                  {/* Reminder Notification */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Reminder: car wash</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Don't forget your upcoming car wash appointment.
                        </p>
                        <p className="text-xs text-gray-500 mt-2">3 days ago</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700">Reminder</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
