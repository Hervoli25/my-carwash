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
    const { bookingDate, timeSlot } = await request.json();

    // Validate input
    if (!bookingDate || !timeSlot) {
      return NextResponse.json({ error: 'Missing booking date or time slot' }, { status: 400 });
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
      include: { user: true, service: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user owns this booking
    if (booking.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized to reschedule this booking' }, { status: 403 });
    }

    // Check if booking can be rescheduled
    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json({ error: 'Only confirmed bookings can be rescheduled' }, { status: 400 });
    }

    // Validate date is in the future
    const newBookingDate = new Date(bookingDate);
    const now = new Date();
    
    if (newBookingDate <= now) {
      return NextResponse.json({ error: 'Booking date must be in the future' }, { status: 400 });
    }

    // Check if date is at least 24 hours in advance
    const hoursInAdvance = (newBookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursInAdvance < 2) {
      return NextResponse.json({ 
        error: 'Bookings must be rescheduled at least 2 hours in advance. Please call us for same-day changes.' 
      }, { status: 400 });
    }

    // Check for existing booking at the same time (basic availability check)
    const existingBooking = await prisma.booking.findFirst({
      where: {
        bookingDate: newBookingDate,
        timeSlot: timeSlot,
        status: 'CONFIRMED',
        id: { not: bookingId } // Exclude current booking
      }
    });

    if (existingBooking) {
      return NextResponse.json({ 
        error: 'The selected time slot is not available. Please choose a different time.' 
      }, { status: 409 });
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        bookingDate: newBookingDate,
        timeSlot: timeSlot,
        updatedAt: new Date()
      },
      include: {
        service: true,
        vehicle: true
      }
    });

    // Create a notification for the user
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Booking Rescheduled',
        message: `Your ${booking.service.name} appointment has been rescheduled to ${newBookingDate.toLocaleDateString()} at ${timeSlot}.`,
        type: 'BOOKING',
      }
    });

    return NextResponse.json({ 
      message: 'Booking rescheduled successfully',
      booking: {
        id: updatedBooking.id,
        bookingDate: updatedBooking.bookingDate,
        timeSlot: updatedBooking.timeSlot,
        service: updatedBooking.service.name,
        vehicle: `${updatedBooking.vehicle.make} ${updatedBooking.vehicle.model}`
      }
    });

  } catch (error) {
    console.error('Error rescheduling booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}