import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withApiAuth, addCorsHeaders } from '@/lib/api-auth';

// CRM API: Search bookings by various criteria
async function handleBookingSearch(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Search parameters
    const referenceNumber = searchParams.get('reference');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const licensePlate = searchParams.get('licensePlate');
    const dateOfBirth = searchParams.get('dateOfBirth');
    const bookingDate = searchParams.get('bookingDate');
    const status = searchParams.get('status');
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    console.log('🔍 CRM SEARCH REQUEST:', {
      referenceNumber,
      firstName,
      lastName,
      email,
      phone,
      licensePlate,
      dateOfBirth,
      bookingDate,
      status,
      page,
      limit
    });

    // Build dynamic search query
    let bookings;
    let totalCount;

    if (referenceNumber) {
      // Search by 8-character reference number
      // Convert reference to database ID pattern matching
      const searchPattern = `%${referenceNumber.toUpperCase()}`;
      
      bookings = await prisma.booking.findMany({
        where: {
          OR: [
            // Try to match the last 8 characters of the ID
            { id: { endsWith: referenceNumber.toLowerCase() } },
            // Also try exact ID match in case they provide full ID
            { id: referenceNumber }
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
              dateOfBirth: true
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              price: true,
              duration: true,
              category: true
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
              vehicleType: true
            }
          },
          addOns: {
            include: {
              addOn: {
                select: {
                  name: true,
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
              paymentMethodType: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      totalCount = await prisma.booking.count({
        where: {
          OR: [
            { id: { endsWith: referenceNumber.toLowerCase() } },
            { id: referenceNumber }
          ]
        }
      });
    } else {
      // Build complex search query for other criteria
      const whereClause: any = {};

      // User-related searches
      if (firstName || lastName || email || phone || dateOfBirth) {
        whereClause.user = {};
        
        if (firstName) {
          whereClause.user.firstName = { contains: firstName, mode: 'insensitive' };
        }
        if (lastName) {
          whereClause.user.lastName = { contains: lastName, mode: 'insensitive' };
        }
        if (email) {
          whereClause.user.email = { contains: email, mode: 'insensitive' };
        }
        if (phone) {
          whereClause.user.phone = { contains: phone };
        }
        if (dateOfBirth) {
          whereClause.user.dateOfBirth = new Date(dateOfBirth);
        }
      }

      // Vehicle search
      if (licensePlate) {
        whereClause.vehicle = {
          licensePlate: { contains: licensePlate.toUpperCase(), mode: 'insensitive' }
        };
      }

      // Booking-specific filters
      if (bookingDate) {
        const searchDate = new Date(bookingDate);
        const startOfDay = new Date(searchDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(searchDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        whereClause.bookingDate = {
          gte: startOfDay,
          lte: endOfDay
        };
      }

      if (status) {
        whereClause.status = status.toUpperCase();
      }

      bookings = await prisma.booking.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              dateOfBirth: true
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              price: true,
              duration: true,
              category: true
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
              vehicleType: true
            }
          },
          addOns: {
            include: {
              addOn: {
                select: {
                  name: true,
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
              paymentMethodType: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      totalCount = await prisma.booking.count({
        where: whereClause
      });
    }

    // Format response with reference numbers
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      referenceNumber: booking.id.slice(-8).toUpperCase(), // Generate display reference
      totalAmountFormatted: `R${(booking.totalAmount / 100).toFixed(2)}`,
      bookingDateFormatted: booking.bookingDate.toLocaleDateString('en-ZA'),
      createdAtFormatted: booking.createdAt.toLocaleString('en-ZA')
    }));

    const response = NextResponse.json({
      success: true,
      data: {
        bookings: formattedBookings,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        },
        searchCriteria: {
          referenceNumber,
          firstName,
          lastName,
          email,
          phone,
          licensePlate,
          dateOfBirth,
          bookingDate,
          status
        }
      },
      timestamp: new Date().toISOString()
    });

    return addCorsHeaders(response, request);

  } catch (error) {
    console.error('❌ CRM booking search error:', error);
    
    const response = NextResponse.json({
      success: false,
      error: 'Failed to search bookings',
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
export const GET = withApiAuth(handleBookingSearch);