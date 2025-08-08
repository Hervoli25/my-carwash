
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Booking {
  id: string;
  date: string;
  service: string;
  vehicle: string;
  plateNumber: string;
  status: string;
  amount: number;
  timeSlot: string;
}

interface RecentBookingsProps {
  bookings: Booking[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return <Badge className="bg-blue-100 text-blue-700">Confirmed</Badge>;
    case 'COMPLETED':
      return <Badge className="bg-green-100 text-green-700">Complete</Badge>;
    case 'CANCELLED':
      return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
    case 'IN_PROGRESS':
      return <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>;
    case 'NO_SHOW':
      return <Badge className="bg-gray-100 text-gray-700">No Show</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bookings found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Service</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Vehicle</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b">
                    <td className="py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(new Date(booking.date))}
                        </div>
                        <div className="text-xs text-gray-500">{booking.timeSlot}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-sm font-medium text-gray-900">{booking.service}</div>
                    </td>
                    <td className="py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.vehicle}</div>
                        <div className="text-xs text-gray-500 font-mono">{booking.plateNumber}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(booking.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
