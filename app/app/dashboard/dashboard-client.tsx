
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { RecentBookings } from '@/components/dashboard/recent-bookings';
import { NotificationsPanel } from '@/components/dashboard/notifications-panel';
import { MembershipBenefits } from '@/components/dashboard/membership-benefits';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Button } from '@/components/ui/button';

interface DashboardData {
  user: any;
  bookings: any[];
  notifications: any[];
  stats: {
    loyaltyPoints: number;
    nextBooking: any;
    topService: string;
    totalServices: number;
    moneySaved: number;
    carbonFootprint: number;
    profileCompletion: number;
    profileFields: {
      total: number;
      completed: number;
      missing: number;
    };
  };
}

export function DashboardClient() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const dashboardData = await response.json();
          setData(dashboardData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">Failed to load dashboard data</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <DashboardSidebar activeTab="dashboard" />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}
              </h1>
              <p className="text-gray-600">
                Here's an overview of your car wash services and account
              </p>
            </div>

            {/* Quick Stats */}
            <DashboardStats stats={data.stats} />

            {/* Quick Actions */}
            <QuickActions />

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Recent Bookings */}
              <div className="xl:col-span-2">
                <RecentBookings bookings={data.bookings} />
              </div>

              {/* Notifications */}
              <div className="xl:col-span-1">
                <NotificationsPanel notifications={data.notifications} />
              </div>
            </div>

            {/* Membership Benefits */}
            <MembershipBenefits 
              membership={data.user.membership} 
              stats={data.stats}
              isAdmin={session?.user?.email === 'hervetshombe@gmail.com'} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
