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
              bookings: true,
              vehicles: true
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
          },
          membership: {
            select: {
              id: true,
              qrCode: true,
              isActive: true,
              autoRenew: true,
              startDate: true,
              endDate: true,
              paymentMethod: true,
              createdAt: true,
              membershipPlan: {
                select: {
                  name: true,
                  displayName: true,
                  price: true,
                  features: true,
                  discountRate: true
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

      // Calculate membership insights
      const membershipValue = user.membership ? (
        user.membership.price * (user.membership.endDate && user.membership.startDate ? 
          Math.ceil((new Date(user.membership.endDate).getTime() - new Date(user.membership.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 1)
      ) : 0;

      const daysRemaining = user.membership?.endDate ? 
        Math.max(0, Math.ceil((new Date(user.membership.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : null;

      return {
        // User Identity
        id: user.id,
        email: user.email,
        name: user.firstName && user.lastName ? 
          `${user.firstName} ${user.lastName}` : 
          user.firstName || user.lastName || 'N/A',
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || 'No Phone',
        isAdmin: user.isAdmin,
        loyaltyPoints: user.loyaltyPoints || 0,
        createdAt: user.createdAt.toISOString(),

        // Booking & Financial Stats
        bookingCount: user._count.bookings,
        vehicleCount: user._count.vehicles,
        totalSpent,
        avgSpentPerBooking: user._count.bookings > 0 ? Math.round(totalSpent / user._count.bookings) : 0,

        // Comprehensive Membership Data
        membership: user.membership ? {
          id: user.membership.id,
          plan: user.membership.plan,
          planDisplay: user.membership.plan === 'BASIC' ? 'Basic Member' : 
                     user.membership.plan === 'PREMIUM' ? 'Premium Member' : 'Elite Member',
          price: user.membership.price,
          priceDisplay: user.membership.price === 0 ? 'FREE' : `R${user.membership.price / 100}/month`,
          isActive: user.membership.isActive,
          status: user.membership.isActive ? 'Active' : 'Inactive',
          autoRenew: user.membership.autoRenew,
          startDate: user.membership.startDate.toISOString(),
          endDate: user.membership.endDate?.toISOString() || null,
          createdAt: user.membership.createdAt.toISOString(),
          
          // Calculated Fields for Admin Management
          membershipDuration: user.membership.endDate && user.membership.startDate ? 
            Math.ceil((new Date(user.membership.endDate).getTime() - new Date(user.membership.startDate).getTime()) / (1000 * 60 * 60 * 24)) : null,
          daysRemaining,
          isExpiringSoon: daysRemaining !== null && daysRemaining <= 7,
          lifetimeValue: membershipValue,
          
          // Status Indicators
          statusColor: user.membership.isActive ? 
            (daysRemaining !== null && daysRemaining <= 7 ? 'warning' : 'success') : 'inactive'
        } : null,

        // Customer Lifecycle
        customerLifetimeValue: totalSpent + membershipValue,
        isVIP: totalSpent > 100000 || user.membership?.plan === 'ELITE', // R1000+ spent or Elite member
        lastActivity: user.createdAt.toISOString(), // Can be enhanced with last booking date
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

// PUT - Admin: Update user or manage membership
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(adminAuthOptions);

    if (!session || !(await requireAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, action, membershipData, userData } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 });
    }

    // Get user with current membership
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { membership: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let result;
    let auditAction;
    let oldValue;
    let newValue;

    switch (action) {
      case 'updateUser':
        // Update user profile information
        const { firstName, lastName, phone, loyaltyPoints } = userData;
        oldValue = { 
          firstName: user.firstName, 
          lastName: user.lastName, 
          phone: user.phone, 
          loyaltyPoints: user.loyaltyPoints 
        };
        
        result = await prisma.user.update({
          where: { id: userId },
          data: {
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            phone: phone || user.phone,
            loyaltyPoints: loyaltyPoints !== undefined ? loyaltyPoints : user.loyaltyPoints
          }
        });
        
        auditAction = 'UPDATE_USER';
        newValue = { firstName, lastName, phone, loyaltyPoints };
        break;

      case 'createMembership':
        if (user.membership) {
          return NextResponse.json({ error: 'User already has a membership' }, { status: 409 });
        }
        
        const { plan, price, duration } = membershipData;
        if (!plan || price === undefined) {
          return NextResponse.json({ error: 'Missing membership plan or price' }, { status: 400 });
        }

        const endDate = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
        
        result = await prisma.membership.create({
          data: {
            userId,
            plan,
            price,
            startDate: new Date(),
            endDate,
            isActive: true,
            autoRenew: true
          }
        });
        
        auditAction = 'CREATE_MEMBERSHIP';
        oldValue = null;
        newValue = { plan, price, endDate };
        break;

      case 'updateMembership':
        if (!user.membership) {
          return NextResponse.json({ error: 'User has no membership to update' }, { status: 404 });
        }
        
        const updateData = membershipData;
        oldValue = {
          plan: user.membership.plan,
          price: user.membership.price,
          isActive: user.membership.isActive,
          autoRenew: user.membership.autoRenew
        };
        
        result = await prisma.membership.update({
          where: { id: user.membership.id },
          data: updateData
        });
        
        auditAction = 'UPDATE_MEMBERSHIP';
        newValue = updateData;
        break;

      case 'cancelMembership':
        if (!user.membership) {
          return NextResponse.json({ error: 'User has no membership to cancel' }, { status: 404 });
        }
        
        oldValue = { isActive: user.membership.isActive };
        
        result = await prisma.membership.update({
          where: { id: user.membership.id },
          data: {
            isActive: false,
            autoRenew: false,
            endDate: new Date() // End immediately
          }
        });
        
        auditAction = 'CANCEL_MEMBERSHIP';
        newValue = { isActive: false, endDate: new Date() };
        break;

      case 'extendMembership':
        if (!user.membership) {
          return NextResponse.json({ error: 'User has no membership to extend' }, { status: 404 });
        }
        
        const { extensionDays = 30 } = membershipData;
        const currentEndDate = user.membership.endDate || new Date();
        const newEndDate = new Date(currentEndDate.getTime() + extensionDays * 24 * 60 * 60 * 1000);
        
        oldValue = { endDate: user.membership.endDate };
        
        result = await prisma.membership.update({
          where: { id: user.membership.id },
          data: {
            endDate: newEndDate,
            isActive: true // Reactivate if was inactive
          }
        });
        
        auditAction = 'EXTEND_MEMBERSHIP';
        newValue = { endDate: newEndDate, extensionDays };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log admin action with detailed audit trail
    await logAdminAction(
      session.user.id,
      auditAction,
      action.includes('Membership') ? 'MEMBERSHIP' : 'USER',
      userId,
      JSON.stringify(oldValue),
      JSON.stringify(newValue),
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: `${action} completed successfully`,
      data: result
    });

  } catch (error) {
    console.error('Admin user/membership update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user/membership' },
      { status: 500 }
    );
  }
}