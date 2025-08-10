
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

    // Calculate realistic money saved and carbon footprint
    const totalSpent = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    
    // Calculate money saved based on membership tier and bulk bookings
    let moneySaved = 0;
    const membershipDiscount = user.membership?.plan === 'PREMIUM' ? 0.20 : 
                              user.membership?.plan === 'BASIC' ? 0.10 : 0.05;
    const bulkBookingDiscount = totalBookings >= 10 ? 0.05 : totalBookings >= 5 ? 0.03 : 0;
    moneySaved = Math.round(totalSpent * (membershipDiscount + bulkBookingDiscount));
    
    // Calculate carbon footprint saved (based on eco-friendly practices)
    // Assume each service saves ~2kg CO2 vs traditional methods
    const carbonFootprintKg = totalBookings * 2.3;
    const carbonFootprintReduction = Math.min(95, Math.round(carbonFootprintKg / 100 * 75)); // Cap at 95%
    
    // Calculate profile completion percentage
    const profileFields = [
      user.firstName,
      user.lastName, 
      user.phone,
      user.address,
      user.city,
      user.province,
      user.dateOfBirth,
      user.gender
    ];
    const completedFields = profileFields.filter(field => field && field.trim() !== '').length;
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100);
    
    // Admin override for Herve - give him Elite membership if he doesn't have one
    const isAdmin = user.email === 'hervetshombe@gmail.com';
    let membershipData = user.membership;
    
    if (isAdmin && !membershipData) {
      // Create Premium membership for admin
      membershipData = await prisma.membership.create({
        data: {
          userId: user.id,
          plan: 'PREMIUM',
          price: 0, // Free for admin
          startDate: new Date(),
          isActive: true,
          autoRenew: false,
        }
      });
      console.log('🔑 Created admin Premium membership for:', user.email);
    }

    const dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        loyaltyPoints: user.loyaltyPoints,
        membership: membershipData ? {
          plan: membershipData.plan,
          isActive: membershipData.isActive,
          startDate: membershipData.startDate,
          endDate: membershipData.endDate,
          price: membershipData.price,
          autoRenew: membershipData.autoRenew
        } : null,
        isAdmin,
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
        carbonFootprint: carbonFootprintReduction, // Dynamic carbon footprint
        profileCompletion,
        profileFields: {
          total: profileFields.length,
          completed: completedFields,
          missing: profileFields.length - completedFields
        }
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
