import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ReviewClient } from './review-client';

interface ReviewPageProps {
  params: { id: string };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
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

  if (booking.status !== 'COMPLETED') {
    redirect('/bookings');
  }

  // Check if user has already reviewed this booking
  const existingReview = await prisma.review.findFirst({
    where: {
      userId: user.id,
      serviceId: booking.serviceId,
      // You might want to add a bookingId field to reviews to be more specific
    }
  });

  return <ReviewClient booking={booking} existingReview={existingReview} />;
}