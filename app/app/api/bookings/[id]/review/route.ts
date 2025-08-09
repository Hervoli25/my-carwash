import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = params.id;
    const { rating, comment, serviceId } = await request.json();

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json({ error: 'Comment must be at least 10 characters long' }, { status: 400 });
    }

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        user: true, 
        service: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user owns this booking
    if (booking.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized to review this booking' }, { status: 403 });
    }

    // Check if booking is completed
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Only completed bookings can be reviewed' }, { status: 400 });
    }

    // Check if user has already reviewed this service (to prevent duplicate reviews)
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        serviceId: serviceId,
        // In a more sophisticated system, you might want to link reviews to specific bookings
        // to allow multiple reviews of the same service by the same user
      }
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this service' }, { status: 409 });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        serviceId: serviceId,
        rating: rating,
        comment: comment.trim(),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        service: {
          select: {
            name: true
          }
        }
      }
    });

    // Update service rating and review count
    const serviceReviews = await prisma.review.findMany({
      where: { serviceId: serviceId },
      select: { rating: true }
    });

    const totalRating = serviceReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / serviceReviews.length;

    await prisma.service.update({
      where: { id: serviceId },
      data: {
        rating: averageRating,
        reviewCount: serviceReviews.length
      }
    });

    // Create a notification for the user
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Review Submitted',
        message: `Thank you for reviewing ${booking.service.name}! Your feedback helps us improve our services.`,
        type: 'SYSTEM',
      }
    });

    return NextResponse.json({ 
      message: 'Review submitted successfully',
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        service: review.service.name,
        submittedAt: review.createdAt
      }
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}