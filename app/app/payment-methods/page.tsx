
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus } from 'lucide-react';

export default async function PaymentMethodsPage() {
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
            <DashboardSidebar activeTab="payment" />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
              <p className="text-gray-600">Manage your saved payment methods</p>
            </div>

            <div className="space-y-6">
              {/* Saved Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Saved Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Visa Card */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">VISA</span>
                      </div>
                      <div>
                        <p className="font-medium">Visa ****4532</p>
                        <p className="text-sm text-gray-600">Expires 12/25</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Default</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Remove</Button>
                    </div>
                  </div>

                  {/* Mastercard */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">MC</span>
                      </div>
                      <div>
                        <p className="font-medium">Mastercard ****8901</p>
                        <p className="text-sm text-gray-600">Expires 08/25</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Remove</Button>
                    </div>
                  </div>

                  <Button className="w-full border-dashed" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Payment Method
                  </Button>
                </CardContent>
              </Card>

              {/* Auto-Pay Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Auto-Pay Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Enable auto-pay</h4>
                        <p className="text-sm text-gray-600">Automatically pay for recurring services</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
