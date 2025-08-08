'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { 
  Users, 
  Car, 
  DollarSign, 
  Calendar,
  Database,
  Settings,
  Shield,
  LogOut,
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Key,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';

interface AdminDashboardClientProps {
  session: any;
}

interface DashboardStats {
  totalUsers: number;
  activeBookings: number;
  totalRevenue: number;
  servicesCount: number;
  todayBookings: number;
  pendingPayments: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isAdmin: boolean;
  loyaltyPoints: number;
  createdAt: string;
  lastLoginAt?: string;
  bookingCount: number;
  totalSpent: number;
  status: 'active' | 'suspended' | 'locked';
}

interface Booking {
  id: string;
  user: { name: string; email: string };
  service: { name: string };
  vehicle: { make: string; model: string; licensePlate: string };
  bookingDate: string;
  timeSlot: string;
  status: string;
  totalAmount: number;
  payment?: { status: string; paymentMethodType?: string };
}

export function AdminDashboardClient({ session }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch users
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }

      // Fetch recent bookings
      const bookingsResponse = await fetch('/api/admin/bookings');
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.bookings);
      }

    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('User action failed:', error);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      const response = await fetch('/api/admin/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        alert('Password reset email sent successfully');
      }
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-2xl font-bold">Admin Control Panel</h1>
              <p className="text-slate-400">Welcome, {session.user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </Button>
            <Button 
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              variant="outline" 
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 min-h-screen p-4">
          <nav className="space-y-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('overview')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('users')}
            >
              <Users className="w-4 h-4 mr-2" />
              User Management
            </Button>
            <Button
              variant={activeTab === 'bookings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Booking Management
            </Button>
            <Button
              variant={activeTab === 'services' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('services')}
            >
              <Car className="w-4 h-4 mr-2" />
              Services & Pricing
            </Button>
            <Button
              variant={activeTab === 'database' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('database')}
            >
              <Database className="w-4 h-4 mr-2" />
              Database Management
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Dashboard Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-400">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-400">{stats.totalUsers}</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-400">Active Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">{stats.activeBookings}</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-400">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-400">
                      {formatCurrency(stats.totalRevenue / 100)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-400">Today's Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-400">{stats.todayBookings}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Users className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Car className="w-4 h-4 mr-2" />
                      Add Service
                    </Button>
                    <Button className="bg-yellow-600 hover:bg-yellow-700">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Database className="w-4 h-4 mr-2" />
                      DB Backup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">User Management</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-600"
                    />
                  </div>
                  <Button>
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              {/* Users Table */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4">User</th>
                          <th className="text-left py-3 px-4">Contact</th>
                          <th className="text-left py-3 px-4">Stats</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{user.name || 'N/A'}</div>
                                <div className="text-sm text-slate-400">ID: {user.id.slice(-8)}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="text-sm">{user.email}</div>
                                <div className="text-sm text-slate-400">{user.phone || 'No phone'}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <div>{user.bookingCount} bookings</div>
                                <div className="text-slate-400">{formatCurrency(user.totalSpent / 100)} spent</div>
                                <div className="text-yellow-400">{user.loyaltyPoints} points</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={
                                user.status === 'active' ? 'bg-green-600' :
                                user.status === 'suspended' ? 'bg-red-600' : 'bg-gray-600'
                              }>
                                {user.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => sendPasswordReset(user.email)}
                                >
                                  <Key className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                                >
                                  {user.status === 'active' ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Booking Management</h2>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Recent Bookings ({bookings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4">Booking</th>
                          <th className="text-left py-3 px-4">Customer</th>
                          <th className="text-left py-3 px-4">Vehicle</th>
                          <th className="text-left py-3 px-4">Service</th>
                          <th className="text-left py-3 px-4">Amount</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">#{booking.id.slice(-8)}</div>
                                <div className="text-sm text-slate-400">
                                  {new Date(booking.bookingDate).toLocaleDateString()} {booking.timeSlot}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{booking.user.name}</div>
                                <div className="text-sm text-slate-400">{booking.user.email}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{booking.vehicle.make} {booking.vehicle.model}</div>
                                <div className="text-sm text-slate-400 font-mono">{booking.vehicle.licensePlate}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium">{booking.service.name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{formatCurrency(booking.totalAmount / 100)}</div>
                                <div className="text-sm text-slate-400">
                                  {booking.payment?.paymentMethodType || 'N/A'}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={
                                booking.status === 'CONFIRMED' ? 'bg-blue-600' :
                                booking.status === 'COMPLETED' ? 'bg-green-600' :
                                booking.status === 'CANCELLED' ? 'bg-red-600' : 'bg-gray-600'
                              }>
                                {booking.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Mail className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Services Tab - Placeholder */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Services & Pricing Management</h2>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <p className="text-slate-400">Service management interface coming next...</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Database Tab - Placeholder */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Database Management</h2>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <p className="text-slate-400">Database management interface coming next...</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab - Placeholder */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">System Settings</h2>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <p className="text-slate-400">System settings interface coming next...</p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}