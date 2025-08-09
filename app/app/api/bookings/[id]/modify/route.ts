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
    const { serviceId, addOns, notes, totalAmount, baseAmount, addOnAmount } = await request.json();

    // Validate input
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
        service: true,
        addOns: {
          include: {
            addOn: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user owns this booking
    if (booking.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized to modify this booking' }, { status: 403 });
    }

    // Check if booking can be modified
    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json({ error: 'Only confirmed bookings can be modified' }, { status: 400 });
    }

    // Verify the service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId, isActive: true }
    });

    if (!service) {
      return NextResponse.json({ error: 'Selected service not found or not active' }, { status: 400 });
    }

    // Validate add-ons if provided
    if (addOns && addOns.length > 0) {
      const addOnIds = addOns.map((a: any) => a.addOnId);
      const validAddOns = await prisma.serviceAddOn.findMany({
        where: { 
          id: { in: addOnIds },
          isActive: true
        }
      });

      if (validAddOns.length !== addOnIds.length) {
        return NextResponse.json({ error: 'One or more selected add-ons are not valid' }, { status: 400 });
      }

      // Validate quantities
      for (const addOn of addOns) {
        if (!addOn.quantity || addOn.quantity < 1 || addOn.quantity > 5) {
          return NextResponse.json({ error: 'Add-on quantities must be between 1 and 5' }, { status: 400 });
        }
      }
    }

    // Start a transaction to update the booking and related data
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Delete existing add-ons for this booking
      await tx.bookingAddOn.deleteMany({
        where: { bookingId: bookingId }
      });

      // Create new add-ons if provided
      if (addOns && addOns.length > 0) {
        for (const addOn of addOns) {
          const addOnData = await tx.serviceAddOn.findUnique({
            where: { id: addOn.addOnId }
          });

          if (addOnData) {
            await tx.bookingAddOn.create({
              data: {
                bookingId: bookingId,
                addOnId: addOn.addOnId,
                quantity: addOn.quantity,
                price: addOnData.price * addOn.quantity // Store total price for this add-on
              }
            });
          }
        }
      }

      // Update the booking
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          serviceId: serviceId,
          totalAmount: totalAmount,
          baseAmount: baseAmount,
          addOnAmount: addOnAmount || 0,
          notes: notes,
          updatedAt: new Date()
        },
        include: {
          service: true,
          vehicle: true,
          addOns: {
            include: {
              addOn: true
            }
          }
        }
      });

      return updated;
    });

    // Create a notification for the user
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Booking Modified',
        message: `Your booking has been updated to ${service.name}. New total: R${(totalAmount / 100).toFixed(2)}.`,
        type: 'BOOKING',
      }
    });

    return NextResponse.json({ 
      message: 'Booking modified successfully',
      booking: {
        id: updatedBooking.id,
        service: updatedBooking.service.name,
        totalAmount: updatedBooking.totalAmount,
        addOnsCount: updatedBooking.addOns.length,
        vehicle: `${updatedBooking.vehicle.make} ${updatedBooking.vehicle.model}`
      }
    });

  } catch (error) {
    console.error('Error modifying booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}