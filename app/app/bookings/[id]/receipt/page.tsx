import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Receipt, 
  Download, 
  Printer, 
  Calendar, 
  Clock, 
  Car, 
  CreditCard,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface ReceiptPageProps {
  params: { id: string };
}

import { ReceiptClient } from './receipt-client';

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      service: true,
      vehicle: true,
      payment: true,
      addOns: {
        include: {
          addOn: true,
        },
      },
    },
  });

  if (!booking || booking.userId !== user.id) {
    redirect('/bookings');
  }

  const receiptNumber = `RCT-${booking.id.slice(-8).toUpperCase()}`;
  const bookingNumber = `BKG-${booking.id.slice(-8).toUpperCase()}`;

  return <ReceiptClient booking={booking} user={user} receiptNumber={receiptNumber} bookingNumber={bookingNumber} />;
}