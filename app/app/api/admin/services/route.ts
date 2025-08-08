import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuthOptions, requireAdmin, logAdminAction } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(adminAuthOptions);

    if (!session || !(await requireAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const includeAddOns = url.searchParams.get('includeAddOns') === 'true';
    const includeStats = url.searchParams.get('includeStats') === 'true';

    let services = await prisma.service.findMany({
      orderBy: { name: 'asc' },
      include: {
        addOns: includeAddOns,
        ...(includeStats && {
          _count: {
            select: {
              bookings: true
            }
          },
          bookings: {
            select: {
              totalAmount: true,
              status: true,
              createdAt: true
            }
          }
        })
      }
    });

    // Transform services for admin view
    const transformedServices = services.map(service => {
      let stats = null;
      if (includeStats && 'bookings' in service) {
        const completedBookings = service.bookings.filter(b => b.status === 'COMPLETED');
        const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        const monthlyBookings = service.bookings.filter(b => 
          new Date(b.createdAt) >= thisMonth
        ).length;

        stats = {
          totalBookings: service.bookings.length,
          completedBookings: completedBookings.length,
          totalRevenue,
          monthlyBookings,
          averageBookingValue: completedBookings.length > 0 ? 
            Math.round(totalRevenue / completedBookings.length) : 0
        };
      }

      return {
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        isActive: service.isActive,
        imageUrl: service.imageUrl,
        category: service.category,
        promotionPrice: service.promotionPrice,
        promotionEndDate: service.promotionEndDate,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        ...(includeAddOns && { addOns: service.addOns }),
        ...(stats && { stats })
      };
    });

    return NextResponse.json({
      services: transformedServices,
      totalServices: services.length
    });

  } catch (error) {
    console.error('Admin services fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(adminAuthOptions);

    if (!session || !(await requireAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      duration,
      category,
      imageUrl,
      isActive = true,
      promotionPrice,
      promotionEndDate
    } = body;

    // Validation
    if (!name || !description || !price || !duration) {
      return NextResponse.json({
        error: 'Name, description, price, and duration are required'
      }, { status: 400 });
    }

    if (price < 0) {
      return NextResponse.json({
        error: 'Price must be positive'
      }, { status: 400 });
    }

    if (promotionPrice && (promotionPrice < 0 || promotionPrice >= price)) {
      return NextResponse.json({
        error: 'Promotion price must be positive and less than base price'
      }, { status: 400 });
    }

    // Create new service
    const newService = await prisma.service.create({
      data: {
        name,
        description,
        shortDesc: description.substring(0, 100),
        price: Math.round(price * 100), // Convert to cents
        duration,
        category: category || 'BASIC',
        features: [],
        imageUrl,
        isActive,
        promotionPrice: promotionPrice ? Math.round(promotionPrice * 100) : null,
        promotionEndDate: promotionEndDate ? new Date(promotionEndDate) : null
      }
    });

    // Log the action
    await logAdminAction(
      session.user.id,
      'CREATE_SERVICE',
      'SERVICE',
      newService.id,
      null,
      {
        name,
        price: newService.price,
        category,
        isActive
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      message: 'Service created successfully',
      service: {
        id: newService.id,
        name: newService.name,
        description: newService.description,
        price: newService.price,
        category: newService.category,
        isActive: newService.isActive
      }
    });

  } catch (error) {
    console.error('Admin service creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}