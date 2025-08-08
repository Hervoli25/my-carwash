import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuthOptions, requireAdmin, logAdminAction } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: { serviceId: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(adminAuthOptions);

    if (!session || !(await requireAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId } = params;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        addOns: {
          orderBy: { name: 'asc' }
        },
        bookings: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            },
            payment: {
              select: {
                status: true,
                amount: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20 // Latest 20 bookings
        }
      }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Calculate service statistics
    const completedBookings = service.bookings.filter(b => b.payment?.status === 'COMPLETED');
    const totalRevenue = completedBookings.reduce((sum, booking) => 
      sum + (booking.payment?.amount || 0), 0
    );

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const monthlyBookings = service.bookings.filter(b => 
      new Date(b.createdAt) >= thisMonth
    ).length;

    const serviceDetails = {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      imageUrl: service.imageUrl,
      isActive: service.isActive,
      promotionPrice: service.promotionPrice,
      promotionEndDate: service.promotionEndDate,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      addOns: service.addOns,
      recentBookings: service.bookings.map(booking => ({
        id: booking.id,
        user: {
          name: booking.user.firstName && booking.user.lastName ? 
            `${booking.user.firstName} ${booking.user.lastName}` : 
            booking.user.firstName || booking.user.lastName || 'N/A',
          email: booking.user.email
        },
        bookingDate: booking.bookingDate,
        status: booking.status,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.payment?.status,
        createdAt: booking.createdAt
      })),
      stats: {
        totalBookings: service.bookings.length,
        completedBookings: completedBookings.length,
        totalRevenue,
        monthlyBookings,
        averageBookingValue: completedBookings.length > 0 ? 
          Math.round(totalRevenue / completedBookings.length) : 0,
        addOnCount: service.addOns.length
      }
    };

    return NextResponse.json(serviceDetails);

  } catch (error) {
    console.error('Admin service fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service details' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(adminAuthOptions);

    if (!session || !(await requireAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId } = params;
    const body = await request.json();

    // Get current service data for logging
    const currentService = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!currentService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const {
      name,
      description,
      price,
      duration,
      category,
      imageUrl,
      isActive,
      promotionPrice,
      promotionEndDate
    } = body;

    // Validation
    if (price !== undefined && price < 0) {
      return NextResponse.json({
        error: 'Price must be positive'
      }, { status: 400 });
    }

    if (promotionPrice !== undefined && promotionPrice !== null) {
      if (promotionPrice < 0 || (price !== undefined ? promotionPrice >= price : promotionPrice >= (currentService.price / 100))) {
        return NextResponse.json({
          error: 'Promotion price must be positive and less than base price'
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) {
      updateData.description = description;
      updateData.shortDesc = description.substring(0, 100);
    }
    if (price !== undefined) updateData.price = Math.round(price * 100);
    if (duration !== undefined) updateData.duration = duration;
    if (category !== undefined) updateData.category = category;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (promotionPrice !== undefined) {
      updateData.promotionPrice = promotionPrice ? Math.round(promotionPrice * 100) : null;
    }
    if (promotionEndDate !== undefined) {
      updateData.promotionEndDate = promotionEndDate ? new Date(promotionEndDate) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: updateData
    });

    // Log the action
    await logAdminAction(
      session.user.id,
      'UPDATE_SERVICE',
      'SERVICE',
      serviceId,
      {
        name: currentService.name,
        price: currentService.price,
        isActive: currentService.isActive,
        promotionPrice: currentService.promotionPrice
      },
      {
        name: updatedService.name,
        price: updatedService.price,
        isActive: updatedService.isActive,
        promotionPrice: updatedService.promotionPrice
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      message: 'Service updated successfully',
      service: {
        id: updatedService.id,
        name: updatedService.name,
        description: updatedService.description,
        price: updatedService.price,
        category: updatedService.category,
        isActive: updatedService.isActive,
        promotionPrice: updatedService.promotionPrice
      }
    });

  } catch (error) {
    console.error('Admin service update error:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(adminAuthOptions);

    if (!session || !(await requireAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId } = params;

    // Get service data for logging
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        _count: {
          select: {
            bookings: true
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Check if service has any bookings
    if (service._count.bookings > 0) {
      return NextResponse.json({
        error: 'Cannot delete service with existing bookings. Consider deactivating it instead.'
      }, { status: 409 });
    }

    // Delete the service
    await prisma.service.delete({
      where: { id: serviceId }
    });

    // Log the action
    await logAdminAction(
      session.user.id,
      'DELETE_SERVICE',
      'SERVICE',
      serviceId,
      {
        name: service.name,
        price: service.price,
        bookingCount: service._count.bookings
      },
      null,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Admin service deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}