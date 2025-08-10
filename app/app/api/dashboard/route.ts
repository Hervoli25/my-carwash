
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('🔐 Dashboard session check:', { 
      hasSession: !!session, 
      userEmail: session?.user?.email,
      userId: session?.user?.id 
    });

    if (!session?.user?.email) {
      console.error('❌ Dashboard unauthorized: No session or email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user data by email (more reliable than user.id)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        vehicles: true,
        membership: true,
      }
    });

    if (!user) {
      console.error('❌ User not found in database:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('👤 User found:', { id: user.id, email: user.email });

    // Fetch recent bookings
    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        service: true,
        vehicle: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log('📊 Fetched data:', { 
      bookings: bookings.length, 
      notifications: notifications.length,
      userId: user.id 
    });

    // Calculate stats
    const totalBookings = await prisma.booking.count({
      where: { userId: user.id }
    });

    const nextBooking = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        bookingDate: {
          gte: new Date(),
        },
        status: 'CONFIRMED',
      },
      include: {
        service: true,
        vehicle: true,
      },
      orderBy: { bookingDate: 'asc' },
    });

    // Get most used service
    const serviceCounts = await prisma.booking.groupBy({
      by: ['serviceId'],
      where: { userId: user.id },
      _count: {
        serviceId: true,
      },
      orderBy: {
        _count: {
          serviceId: 'desc',
        },
      },
      take: 1,
    });

    let topService = 'Express Wash';
    if (serviceCounts.length > 0) {
      const topServiceData = await prisma.service.findUnique({
        where: { id: serviceCounts[0].serviceId },
      });
      topService = topServiceData?.name || 'Express Wash';
    }

    // Calculate money saved (simplified calculation)
    const totalSpent = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const moneySaved = Math.round(totalSpent * 0.15); // Assume 15% savings

    const dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        loyaltyPoints: user.loyaltyPoints,
        membership: user.membership,
      },
      bookings: bookings.map(booking => ({
        id: booking.id,
        date: booking.bookingDate,
        service: booking.service.name,
        vehicle: `${booking.vehicle.make} ${booking.vehicle.model} ${booking.vehicle.year}`,
        plateNumber: booking.vehicle.licensePlate,
        status: booking.status,
        amount: booking.totalAmount,
        timeSlot: booking.timeSlot,
      })),
      notifications: notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      })),
      stats: {
        loyaltyPoints: user.loyaltyPoints,
        nextBooking: nextBooking ? {
          service: nextBooking.service.name,
          date: nextBooking.bookingDate,
          timeSlot: nextBooking.timeSlot,
        } : null,
        topService,
        totalServices: totalBookings,
        moneySaved: Math.round(moneySaved / 100), // Convert to rand
        carbonFootprint: 76, // Static value as per wireframe
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('💥 Dashboard API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
