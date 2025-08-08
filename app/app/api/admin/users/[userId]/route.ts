import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuthOptions, requireAdmin, logAdminAction } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

interface RouteParams {
  params: { userId: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(adminAuthOptions);

    if (!session || !(await requireAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bookings: {
          include: {
            service: true,
            vehicle: true,
            payment: true,
            addOns: {
              include: {
                addOn: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        vehicles: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate user stats
    const completedBookings = user.bookings.filter(b => b.status === 'COMPLETED');
    const totalSpent = completedBookings.reduce((sum, booking) => 
      sum + (booking.payment?.amount || 0), 0
    );

    const userDetails = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      loyaltyPoints: user.loyaltyPoints || 0,

      createdAt: user.createdAt,

      totalSpent,
      bookingCount: user.bookings.length,
      completedBookings: completedBookings.length,
      vehicles: user.vehicles,
      recentBookings: user.bookings.slice(0, 10)
    };

    return NextResponse.json(userDetails);

  } catch (error) {
    console.error('Admin user fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
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

    const { userId } = params;
    const body = await request.json();
    const { action, ...updateData } = body;

    // Get current user data for logging
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let updatedUser;
    let actionDescription = action;

    if (action) {
      return NextResponse.json({ error: 'Action not supported' }, { status: 400 });
    } else {
      // Handle direct field updates
      const allowedFields = ['firstName', 'lastName', 'phone', 'loyaltyPoints'];
      const filteredData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {} as any);

      if (Object.keys(filteredData).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
      }

      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: filteredData
      });
      actionDescription = 'UPDATE_USER';
    }

    // Log the action
    await logAdminAction(
      session.user.id,
      actionDescription,
      'USER',
      userId,
      {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        phone: currentUser.phone,
        loyaltyPoints: currentUser.loyaltyPoints
      },
      {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        loyaltyPoints: updatedUser.loyaltyPoints
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        loyaltyPoints: updatedUser.loyaltyPoints
      }
    });

  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
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

    const { userId } = params;

    // Get user data for logging
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bookings: { select: { id: true } },
        vehicles: { select: { id: true } }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        userId: userId,
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] }
      }
    });

    if (activeBookings > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete user with active bookings' 
      }, { status: 409 });
    }

    // Soft-delete/anonymize user instead of hard delete
    await prisma.user.update({
      where: { id: userId },
      data: {
        // Anonymize email to prevent conflicts and indicate deletion
        email: `deleted_${Date.now()}_${user.email}`,
        // Optional anonymization of profile fields
        firstName: null,
        lastName: null,
        phone: null,
        name: null,
        password: null
      }
    });

    // Log the action
    await logAdminAction(
      session.user.id,
      'DELETE_USER',
      'USER',
      userId,
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bookingCount: user.bookings.length
      },
      null,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Admin user deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}