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
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';


    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }



    // Get users with booking stats
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              bookings: true
            }
          },
          bookings: {
            select: {
              payment: {
                select: {
                  amount: true,
                  status: true
                }
              }
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Transform users to include computed stats
    const transformedUsers = users.map(user => {
      const completedPayments = user.bookings.filter(booking => 
        booking.payment?.status === 'COMPLETED'
      );
      
      const totalSpent = completedPayments.reduce((sum, booking) => 
        sum + (booking.payment?.amount || 0), 0
      );

      return {
        id: user.id,
        email: user.email,
        name: user.firstName && user.lastName ? 
          `${user.firstName} ${user.lastName}` : 
          user.firstName || user.lastName || 'N/A',
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isAdmin: user.isAdmin,
        loyaltyPoints: user.loyaltyPoints || 0,
        createdAt: user.createdAt.toISOString(),

        bookingCount: user._count.bookings,
        totalSpent,

      };
    });

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
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
    const { email, firstName, lastName, phone } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        loyaltyPoints: 0
      }
    });

    // Log the action
    await logAdminAction(
      session.user.id,
      'CREATE_USER',
      'USER',
      newUser.id,
      null,
      { email, firstName, lastName, phone },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.firstName && newUser.lastName ?
          `${newUser.firstName} ${newUser.lastName}` :
          newUser.firstName || newUser.lastName || 'N/A'
      }
    });

  } catch (error) {
    console.error('Admin user creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}