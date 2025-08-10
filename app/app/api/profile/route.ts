import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// GET - Fetch user profile with optional booking history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const includeBookings = url.searchParams.get('include_bookings') === 'true';

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        vehicles: {
          orderBy: { createdAt: 'desc' }
          // Get all vehicles for user selection
        },
        ...(includeBookings && {
          bookings: {
            include: {
              service: true,
              vehicle: true,
              addOns: {
                include: {
                  addOn: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 20 // Last 20 bookings for analysis
          }
        })
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profileData = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        phone: user.phone,
        address: user.address,
        city: user.city,
        province: user.province,
        loyaltyPoints: user.loyaltyPoints
      },
      vehicles: user.vehicles || [],
      ...(includeBookings && {
        bookingHistory: user.bookings || []
      })
    };

    return NextResponse.json(profileData);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, address, city, province } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName,
        lastName,
        name: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || null,
        phone,
        address,
        city,
        province,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        name: updatedUser.name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        province: updatedUser.province,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
