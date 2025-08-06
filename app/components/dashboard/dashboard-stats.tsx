
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar,
  Star,
  Trophy,
  Car
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface StatsProps {
  stats: {
    loyaltyPoints: number;
    nextBooking: any;
    topService: string;
    totalServices: number;
    moneySaved: number;
    carbonFootprint: number;
  };
}

export function DashboardStats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Next Booking */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Next Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-full">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              {stats.nextBooking ? (
                <>
                  <p className="text-lg font-semibold text-gray-900">
                    {stats.nextBooking.service}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(new Date(stats.nextBooking.date))} at {stats.nextBooking.timeSlot}
                  </p>
                </>
              ) : (
                <p className="text-lg font-semibold text-gray-900">No upcoming bookings</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Points */}
      <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-700">Loyalty Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-600 rounded-full">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.loyaltyPoints}</p>
              <p className="text-sm text-gray-600">points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Service */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-700">#1 Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-600 rounded-full">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{stats.topService}</p>
              <p className="text-sm text-gray-600">Most used service</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
