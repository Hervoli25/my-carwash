import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { RescheduleClient } from './reschedule-client';

interface ReschedulePageProps {
  params: { id: string };
}

export default async function ReschedulePage({ params }: ReschedulePageProps) {
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

  if (booking.status !== 'CONFIRMED') {
    redirect('/bookings');
  }

  return <RescheduleClient booking={booking} />;
}