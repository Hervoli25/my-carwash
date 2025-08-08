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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get comprehensive stats
    const [
      totalUsers,
      activeBookings,
      totalRevenue,
      servicesCount,
      todayBookings,
      pendingPayments
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),

      // Active bookings (confirmed but not completed)
      prisma.booking.count({
        where: {
          status: {
            in: ['CONFIRMED', 'IN_PROGRESS']
          }
        }
      }),

      // Total revenue from completed bookings
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          booking: {
            status: 'COMPLETED'
          }
        },
        _sum: {
          amount: true
        }
      }),

      // Total services count
      prisma.service.count(),

      // Today's bookings
      prisma.booking.count({
        where: {
          bookingDate: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Pending payments
      prisma.payment.count({
        where: {
          status: 'PENDING'
        }
      })
    ]);

    const stats = {
      totalUsers,
      activeBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      servicesCount,
      todayBookings,
      pendingPayments
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}