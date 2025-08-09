
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Header } from '@/components/header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { BookingsClient } from './bookings-client';

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Fetch user's bookings
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      service: { select: { id: true, name: true, description: true, category: true, duration: true, price: true } },
      vehicle: true,
      payment: true,
      addOns: {
        include: {
          addOn: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return <BookingsClient bookings={bookings} />;
}
