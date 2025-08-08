import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuthOptions, requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(adminAuthOptions);

    if (!session || !(await requireAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status') || '';
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.bookingDate = {};
      if (startDate) {
        where.bookingDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.bookingDate.lte = new Date(endDate);
      }
    }

    // Get bookings with related data
    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              price: true
            }
          },
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              licensePlate: true
            }
          },
          payment: true,
          addOns: {
            include: {
              addOn: {
                select: {
                  name: true,
                  price: true
                }
              }
            }
          }
        }
      }),
      prisma.booking.count({ where })
    ]);

    // Transform bookings for admin view
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      user: {
        id: booking.user.id,
        name: booking.user.firstName && booking.user.lastName ? 
          `${booking.user.firstName} ${booking.user.lastName}` : 
          booking.user.firstName || booking.user.lastName || 'N/A',
        email: booking.user.email
      },
      service: {
        id: booking.service.id,
        name: booking.service.name,
        price: booking.service.price
      },
      vehicle: {
        id: booking.vehicle.id,
        make: booking.vehicle.make,
        model: booking.vehicle.model,
        licensePlate: booking.vehicle.licensePlate
      },
      bookingDate: booking.bookingDate.toISOString(),
      timeSlot: booking.timeSlot,
      status: booking.status,
      totalAmount: booking.totalAmount,
      notes: booking.notes,
      payment: booking.payment ? {
        id: booking.payment.id,
        amount: booking.payment.amount,
        status: booking.payment.status,
        paymentMethodType: booking.payment.paymentMethodType,
        createdAt: booking.payment.createdAt.toISOString()
      } : null,
      addOns: booking.addOns.map(addOn => ({
        name: addOn.addOn.name,
        price: addOn.addOn.price,
        quantity: addOn.quantity
      })),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString()
    }));

    return NextResponse.json({
      bookings: transformedBookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Admin bookings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}