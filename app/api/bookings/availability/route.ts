import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const timeSlot = searchParams.get('timeSlot');
    const serviceId = searchParams.get('serviceId');
    const includeServices = searchParams.get('includeServices') === 'true';

    if (!date || !timeSlot) {
      return NextResponse.json(
        { error: 'Date and timeSlot are required' },
        { status: 400 }
      );
    }

    // Parse the date
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    // Get the end of the day for the query
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Count existing bookings for this specific date and time slot
    const existingBookings = await prisma.booking.count({
      where: {
        bookingDate: {
          gte: bookingDate,
          lte: endOfDay,
        },
        timeSlot: timeSlot,
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS'] // Only count active bookings
        }
      }
    });

    // Debug: Get actual bookings to see what's in the database
    const actualBookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: bookingDate,
          lte: endOfDay,
        },
        timeSlot: timeSlot,
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS']
        }
      },
      select: {
        id: true,
        status: true,
        timeSlot: true,
        bookingDate: true,
        createdAt: true,
        service: {
          select: {
            name: true
          }
        }
      }
    });

    // Get services information if requested (for smart capacity management)
    let services: string[] = [];
    if (includeServices) {
      const bookingsWithServices = await prisma.booking.findMany({
        where: {
          bookingDate: {
            gte: bookingDate,
            lte: endOfDay,
          },
          timeSlot: timeSlot,
          status: {
            in: ['CONFIRMED', 'IN_PROGRESS'] // Match the main query
          }
        },
        select: {
          service: {
            select: {
              name: true
            }
          }
        }
      });

      // Map service names to service IDs for consistency
      services = bookingsWithServices.map(booking => {
        const serviceName = booking.service?.name || '';
        return getServiceIdFromName(serviceName);
      }).filter(Boolean);
    }

    // Optional: Get service-specific bookings if serviceId is provided
    let serviceSpecificBookings = 0;
    if (serviceId) {
      serviceSpecificBookings = await prisma.booking.count({
        where: {
          bookingDate: {
            gte: bookingDate,
            lte: endOfDay,
          },
          timeSlot: timeSlot,
          service: {
            name: {
              contains: getServiceNameFromId(serviceId)
            }
          },
          status: {
            in: ['CONFIRMED', 'IN_PROGRESS'] // Consistent with main query
          }
        }
      });
    }

    // Get total bookings for the entire day (for analytics/capacity planning)
    const totalDayBookings = await prisma.booking.count({
      where: {
        bookingDate: {
          gte: bookingDate,
          lte: endOfDay,
        },
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS'] // Consistent with main query
        }
      }
    });

    // Enhanced debug logging with actual booking details
    console.log('📊 AVAILABILITY CHECK:', {
      date,
      timeSlot,
      existingBookings,
      actualBookingsFound: actualBookings.length,
      actualBookingDetails: actualBookings.map(b => ({
        id: b.id,
        status: b.status,
        timeSlot: b.timeSlot,
        service: b.service?.name,
        createdAt: b.createdAt
      })),
      services,
      serviceSpecificBookings,
      totalDayBookings,
      timestamp: new Date().toISOString(),
      queryDateRange: {
        start: bookingDate.toISOString(),
        end: endOfDay.toISOString()
      }
    });

    // Return availability data
    return NextResponse.json({
      success: true,
      date: date,
      timeSlot: timeSlot,
      bookingCount: existingBookings,
      services: services, // Array of service IDs for smart capacity calculation
      serviceSpecificBookings: serviceSpecificBookings,
      totalDayBookings: totalDayBookings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching booking availability:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch availability data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to map service IDs to service names
function getServiceNameFromId(serviceId: string): string {
  const serviceMapping: { [key: string]: string } = {
    'express': 'Express Exterior Wash',
    'premium': 'Premium Wash & Wax',
    'deluxe': 'Deluxe Interior & Exterior',
    'executive': 'Executive Detail Package'
  };

  return serviceMapping[serviceId] || '';
}

// Helper function to map service names to service IDs
function getServiceIdFromName(serviceName: string): string {
  const reverseMapping: { [key: string]: string } = {
    'Express Exterior Wash': 'express',
    'Premium Wash & Wax': 'premium',
    'Deluxe Interior & Exterior': 'deluxe',
    'Executive Detail Package': 'executive'
  };

  return reverseMapping[serviceName] || '';
}

// Optional: Add a POST endpoint for batch availability checks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dates, timeSlots, serviceId } = body;

    if (!dates || !Array.isArray(dates) || !timeSlots || !Array.isArray(timeSlots)) {
      return NextResponse.json(
        { error: 'Dates and timeSlots arrays are required' },
        { status: 400 }
      );
    }

    const availabilityData = [];

    // Check availability for each date and time slot combination
    for (const date of dates) {
      const bookingDate = new Date(date);
      bookingDate.setHours(0, 0, 0, 0);
      const endOfDay = new Date(bookingDate);
      endOfDay.setHours(23, 59, 59, 999);

      for (const timeSlot of timeSlots) {
        const existingBookings = await prisma.booking.count({
          where: {
            bookingDate: {
              gte: bookingDate,
              lte: endOfDay,
            },
            timeSlot: timeSlot,
            status: {
              in: ['CONFIRMED', 'IN_PROGRESS'] // Consistent with main query
            }
          }
        });

        availabilityData.push({
          date,
          timeSlot,
          bookingCount: existingBookings,
          available: existingBookings < 10 // Default capacity, should be configurable
        });
      }
    }

    return NextResponse.json({
      success: true,
      availability: availabilityData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching batch availability:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch batch availability data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}