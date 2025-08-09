import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ModifyClient } from './modify-client';

interface ModifyPageProps {
  params: { id: string };
}

export default async function ModifyPage({ params }: ModifyPageProps) {
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

  // Get available services and add-ons
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { category: 'asc' },
  });

  const addOns = await prisma.serviceAddOn.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return <ModifyClient booking={booking} services={services} addOns={addOns} />;
}