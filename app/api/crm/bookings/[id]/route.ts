import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withApiAuth, addCorsHeaders } from '@/lib/api-auth';

// CRM API: Get detailed booking information by ID
async function handleBookingDetails(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id;

    console.log('🔍 CRM BOOKING DETAILS REQUEST:', { bookingId });

    // Try to find booking by ID or by last 8 characters
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id: bookingId },
          { id: { endsWith: bookingId.toLowerCase() } }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            address: true,
            city: true,
            province: true,
            loyaltyPoints: true,
            createdAt: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            category: true,
            features: true
          }
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            color: true,
            licensePlate: true,
            vehicleType: true,
            isPrimary: true
          }
        },
        addOns: {
          include: {
            addOn: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentDate: true,
            paymentMethodType: true,
            currency: true,
            description: true,
            transactionId: true
          }
        }
      }
    });

    if (!booking) {
      const response = NextResponse.json({
        success: false,
        error: 'Booking not found',
        message: `No booking found with ID: ${bookingId}`
      }, { status: 404 });

      return addCorsHeaders(response, request);
    }

    // Format the response with additional computed fields
    const formattedBooking = {
      ...booking,
      referenceNumber: booking.id.slice(-8).toUpperCase(),
      totalAmountFormatted: `R${(booking.totalAmount / 100).toFixed(2)}`,
      baseAmountFormatted: `R${(booking.baseAmount / 100).toFixed(2)}`,
      addOnAmountFormatted: `R${(booking.addOnAmount / 100).toFixed(2)}`,
      bookingDateFormatted: booking.bookingDate.toLocaleDateString('en-ZA'),
      bookingTimeFormatted: booking.timeSlot,
      createdAtFormatted: booking.createdAt.toLocaleString('en-ZA'),
      updatedAtFormatted: booking.updatedAt.toLocaleString('en-ZA'),
      
      // Customer summary
      customerSummary: {
        fullName: `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim(),
        contact: {
          email: booking.user.email,
          phone: booking.user.phone
        },
        address: {
          street: booking.user.address,
          city: booking.user.city,
          province: booking.user.province
        },
        dateOfBirth: booking.user.dateOfBirth?.toLocaleDateString('en-ZA'),
        loyaltyPoints: booking.user.loyaltyPoints,
        customerSince: booking.user.createdAt.toLocaleDateString('en-ZA')
      },
      
      // Vehicle summary
      vehicleSummary: {
        display: `${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}`,
        details: {
          make: booking.vehicle.make,
          model: booking.vehicle.model,
          year: booking.vehicle.year,
          color: booking.vehicle.color,
          type: booking.vehicle.vehicleType
        },
        licensePlate: booking.vehicle.licensePlate,
        isPrimary: booking.vehicle.isPrimary
      },
      
      // Service summary
      serviceSummary: {
        name: booking.service.name,
        category: booking.service.category,
        duration: `${booking.service.duration} minutes`,
        basePrice: `R${(booking.service.price / 100).toFixed(2)}`,
        features: booking.service.features,
        description: booking.service.description
      },
      
      // Add-ons summary
      addOnsSummary: booking.addOns.map(addOn => ({
        name: addOn.addOn.name,
        description: addOn.addOn.description,
        quantity: addOn.quantity,
        unitPrice: `R${(addOn.addOn.price / 100).toFixed(2)}`,
        totalPrice: `R${(addOn.price * addOn.quantity / 100).toFixed(2)}`
      })),
      
      // Payment summary
      paymentSummary: booking.payment ? {
        amount: `R${(booking.payment.amount / 100).toFixed(2)}`,
        status: booking.payment.status,
        method: booking.payment.paymentMethodType,
        paymentDate: booking.payment.paymentDate?.toLocaleString('en-ZA'),
        transactionId: booking.payment.transactionId,
        currency: booking.payment.currency
      } : null,
      
      // Status information
      statusInfo: {
        current: booking.status,
        canCancel: booking.status === 'CONFIRMED' && new Date() < booking.bookingDate,
        canModify: booking.status === 'CONFIRMED' && new Date() < booking.bookingDate,
        cancelledAt: booking.cancelledAt?.toLocaleString('en-ZA'),
        cancellationReason: booking.cancellationReason,
        completedAt: booking.completedAt?.toLocaleString('en-ZA')
      }
    };

    const response = NextResponse.json({
      success: true,
      data: formattedBooking,
      timestamp: new Date().toISOString()
    });

    return addCorsHeaders(response, request);

  } catch (error) {
    console.error('❌ CRM booking details error:', error);
    
    const response = NextResponse.json({
      success: false,
      error: 'Failed to fetch booking details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });

    return addCorsHeaders(response, request);
  } finally {
    await prisma.$disconnect();
  }
}

// CRM API: Update booking status
async function handleBookingUpdate(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id;
    const updateData = await request.json();

    console.log('📝 CRM BOOKING UPDATE REQUEST:', { bookingId, updateData });

    // Find the booking first
    const existingBooking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id: bookingId },
          { id: { endsWith: bookingId.toLowerCase() } }
        ]
      }
    });

    if (!existingBooking) {
      const response = NextResponse.json({
        success: false,
        error: 'Booking not found',
        message: `No booking found with ID: ${bookingId}`
      }, { status: 404 });

      return addCorsHeaders(response, request);
    }

    // Prepare update data
    const updateFields: any = {};
    
    if (updateData.status) {
      updateFields.status = updateData.status.toUpperCase();
      
      if (updateData.status.toUpperCase() === 'CANCELLED') {
        updateFields.cancelledAt = new Date();
        updateFields.cancellationReason = updateData.cancellationReason || 'Cancelled via CRM';
      }
      
      if (updateData.status.toUpperCase() === 'COMPLETED') {
        updateFields.completedAt = new Date();
      }
    }
    
    if (updateData.notes) {
      updateFields.notes = updateData.notes;
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: existingBooking.id },
      data: updateFields,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        service: {
          select: {
            name: true
          }
        },
        vehicle: {
          select: {
            licensePlate: true
          }
        }
      }
    });

    const response = NextResponse.json({
      success: true,
      data: {
        ...updatedBooking,
        referenceNumber: updatedBooking.id.slice(-8).toUpperCase(),
        message: `Booking ${updatedBooking.id.slice(-8).toUpperCase()} updated successfully`
      },
      timestamp: new Date().toISOString()
    });

    return addCorsHeaders(response, request);

  } catch (error) {
    console.error('❌ CRM booking update error:', error);
    
    const response = NextResponse.json({
      success: false,
      error: 'Failed to update booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });

    return addCorsHeaders(response, request);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response, request);
}

// Protected endpoints
export const GET = withApiAuth(handleBookingDetails);
export const PUT = withApiAuth(handleBookingUpdate);