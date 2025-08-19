import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withApiAuth, addCorsHeaders } from '@/lib/api-auth';

// CRM API: Get dashboard statistics for car wash business
async function handleDashboardStats(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Date range filters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Default to current month if no dates provided
    const now = new Date();
    const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const dateFilter = {
      createdAt: {
        gte: startDate ? new Date(startDate) : defaultStartDate,
        lte: endDate ? new Date(endDate) : defaultEndDate
      }
    };

    console.log('📊 CRM DASHBOARD STATS REQUEST:', {
      startDate: startDate || defaultStartDate.toISOString(),
      endDate: endDate || defaultEndDate.toISOString()
    });

    // Execute all queries in parallel for better performance
    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue,
      totalCustomers,
      newCustomers,
      popularServices,
      recentBookings,
      bookingsByStatus,
      bookingsByService,
      monthlyTrends
    ] = await Promise.all([
      // Total bookings in period
      prisma.booking.count({
        where: dateFilter
      }),
      
      // Confirmed bookings
      prisma.booking.count({
        where: {
          ...dateFilter,
          status: 'CONFIRMED'
        }
      }),
      
      // Cancelled bookings
      prisma.booking.count({
        where: {
          ...dateFilter,
          status: 'CANCELLED'
        }
      }),
      
      // Completed bookings
      prisma.booking.count({
        where: {
          ...dateFilter,
          status: 'COMPLETED'
        }
      }),
      
      // Total revenue (completed bookings only)
      prisma.booking.aggregate({
        where: {
          ...dateFilter,
          status: 'COMPLETED'
        },
        _sum: {
          totalAmount: true
        }
      }),
      
      // Total customers
      prisma.user.count(),
      
      // New customers in period
      prisma.user.count({
        where: dateFilter
      }),
      
      // Popular services
      prisma.booking.groupBy({
        by: ['serviceId'],
        where: dateFilter,
        _count: {
          serviceId: true
        },
        orderBy: {
          _count: {
            serviceId: 'desc'
          }
        },
        take: 5
      }),
      
      // Recent bookings (last 10)
      prisma.booking.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
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
      }),
      
      // Bookings by status
      prisma.booking.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: {
          status: true
        }
      }),
      
      // Bookings by service
      prisma.booking.groupBy({
        by: ['serviceId'],
        where: dateFilter,
        _count: {
          serviceId: true
        },
        _sum: {
          totalAmount: true
        }
      }),
      
      // Monthly trends (last 6 months)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*)::int as bookings,
          SUM("totalAmount")::int as revenue,
          COUNT(DISTINCT "userId")::int as unique_customers
        FROM "Booking" 
        WHERE "createdAt" >= ${new Date(now.getFullYear(), now.getMonth() - 5, 1)}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
      `
    ]);

    // Get service names for popular services
    const serviceIds = popularServices.map(s => s.serviceId);
    const services = await prisma.service.findMany({
      where: {
        id: {
          in: serviceIds
        }
      },
      select: {
        id: true,
        name: true,
        category: true
      }
    });

    // Format popular services with names
    const popularServicesWithNames = popularServices.map(ps => {
      const service = services.find(s => s.id === ps.serviceId);
      return {
        serviceId: ps.serviceId,
        serviceName: service?.name || 'Unknown Service',
        category: service?.category || 'UNKNOWN',
        bookingCount: ps._count.serviceId
      };
    });

    // Format service performance data
    const servicePerformance = await Promise.all(
      bookingsByService.map(async (bs) => {
        const service = await prisma.service.findUnique({
          where: { id: bs.serviceId },
          select: { name: true, category: true }
        });
        return {
          serviceId: bs.serviceId,
          serviceName: service?.name || 'Unknown Service',
          category: service?.category || 'UNKNOWN',
          bookingCount: bs._count.serviceId,
          totalRevenue: bs._sum.totalAmount || 0,
          revenueFormatted: `R${((bs._sum.totalAmount || 0) / 100).toFixed(2)}`
        };
      })
    );

    // Calculate key metrics
    const averageBookingValue = totalRevenue._sum.totalAmount && completedBookings > 0 
      ? totalRevenue._sum.totalAmount / completedBookings 
      : 0;
    
    const conversionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

    // Format response
    const response = NextResponse.json({
      success: true,
      data: {
        summary: {
          totalBookings,
          confirmedBookings,
          cancelledBookings,
          completedBookings,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          totalRevenueFormatted: `R${((totalRevenue._sum.totalAmount || 0) / 100).toFixed(2)}`,
          totalCustomers,
          newCustomers,
          averageBookingValue,
          averageBookingValueFormatted: `R${(averageBookingValue / 100).toFixed(2)}`,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          cancellationRate: parseFloat(cancellationRate.toFixed(2))
        },
        
        popularServices: popularServicesWithNames,
        
        recentBookings: recentBookings.map(booking => ({
          id: booking.id,
          referenceNumber: booking.id.slice(-8).toUpperCase(),
          customerName: `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim(),
          service: booking.service.name,
          licensePlate: booking.vehicle.licensePlate,
          status: booking.status,
          totalAmount: `R${(booking.totalAmount / 100).toFixed(2)}`,
          bookingDate: booking.bookingDate.toLocaleDateString('en-ZA'),
          createdAt: booking.createdAt.toLocaleString('en-ZA')
        })),
        
        statusBreakdown: bookingsByStatus.map(bs => ({
          status: bs.status,
          count: bs._count.status,
          percentage: totalBookings > 0 ? parseFloat(((bs._count.status / totalBookings) * 100).toFixed(1)) : 0
        })),
        
        servicePerformance: servicePerformance.sort((a, b) => b.bookingCount - a.bookingCount),
        
        monthlyTrends: (monthlyTrends as any[]).map(trend => ({
          month: new Date(trend.month).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long' }),
          bookings: trend.bookings,
          revenue: trend.revenue,
          revenueFormatted: `R${(trend.revenue / 100).toFixed(2)}`,
          uniqueCustomers: trend.unique_customers
        })),
        
        period: {
          startDate: (startDate ? new Date(startDate) : defaultStartDate).toLocaleDateString('en-ZA'),
          endDate: (endDate ? new Date(endDate) : defaultEndDate).toLocaleDateString('en-ZA')
        }
      },
      timestamp: new Date().toISOString()
    });

    return addCorsHeaders(response, request);

  } catch (error) {
    console.error('❌ CRM dashboard stats error:', error);
    
    const response = NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
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

// Protected GET endpoint
export const GET = withApiAuth(handleDashboardStats);