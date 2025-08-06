
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus,
  Calendar,
  Crown
} from 'lucide-react';

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/book">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Book New Service
            </Button>
          </Link>
          
          <Link href="/bookings">
            <Button variant="outline" className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Reschedule Booking
            </Button>
          </Link>
          
          <Link href="/membership">
            <Button variant="outline" className="w-full">
              <Crown className="w-4 h-4 mr-2" />
              View Membership
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
