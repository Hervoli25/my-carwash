
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Car, Shield, Settings } from 'lucide-react';
import { GDPRCompliance } from '@/components/legal/gdpr-compliance';

export default async function ProfilePage() {
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
            <DashboardSidebar activeTab="profile" />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your account information and preferences</p>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <Input defaultValue="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <Input defaultValue="Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input defaultValue="john@doe.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <Input defaultValue="+27-123-456-789" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Vehicle</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option>2020 Toyota Corolla</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
                      <Input defaultValue="CA 123 GP" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Change Password</h4>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                      <Button variant="outline" size="sm">Change</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
              </div>
            </div>

            {/* GDPR Compliance Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Data Privacy & GDPR Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GDPRCompliance showManagement={true} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
