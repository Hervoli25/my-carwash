import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Join waitlist for fully booked time slots
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      customerName,
      email,
      phone,
      preferredDate,
      preferredTime,
      serviceId,
      vehicleInfo,
      alternativeTimes = []
    } = body;

    if (!email || !preferredDate || !serviceId) {
      return NextResponse.json(
        { error: 'Email, preferred date, and service are required' },
        { status: 400 }
      );
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already on waitlist for this date/time/service
    const existingWaitlist = await prisma.waitlist.findFirst({
      where: {
        userId: user.id,
        preferredDate: new Date(preferredDate),
        preferredTime: preferredTime || null,
        serviceId,
        status: 'ACTIVE'
      }
    });

    if (existingWaitlist) {
      return NextResponse.json(
        { error: 'You are already on the waitlist for this time slot' },
        { status: 400 }
      );
    }

    // Create waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        userId: user.id,
        customerName,
        email,
        phone: phone || '',
        preferredDate: new Date(preferredDate),
        preferredTime,
        serviceId,
        vehicleInfo: vehicleInfo || '',
        alternativeTimes: alternativeTimes,
        status: 'ACTIVE',
        priority: await getWaitlistPriority(user.id), // Higher for loyal customers
        notificationsSent: 0
      }
    });

    // Send confirmation email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'waitlist_confirmation',
          data: {
            customerName,
            email,
            preferredDate: new Date(preferredDate).toLocaleDateString(),
            preferredTime: preferredTime || 'Any available time',
            service: await getServiceName(serviceId),
            waitlistId: waitlistEntry.id.slice(-8).toUpperCase()
          }
        }),
      });
    } catch (emailError) {
      console.error('Waitlist confirmation email failed:', emailError);
    }

    // Log for admin monitoring
    console.log('📋 NEW WAITLIST ENTRY:', {
      id: waitlistEntry.id,
      customer: customerName,
      email,
      date: preferredDate,
      time: preferredTime,
      service: serviceId,
      priority: waitlistEntry.priority,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      waitlist: {
        id: waitlistEntry.id,
        position: await getWaitlistPosition(waitlistEntry.id),
        estimatedWaitTime: 'We\'ll notify you as soon as a slot becomes available'
      },
      message: 'Successfully added to waitlist'
    });

  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      { 
        error: 'Failed to join waitlist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Get waitlist status for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const activeWaitlists = await prisma.waitlist.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const waitlistsWithPosition = await Promise.all(
      activeWaitlists.map(async (waitlist) => ({
        ...waitlist,
        position: await getWaitlistPosition(waitlist.id),
        serviceName: await getServiceName(waitlist.serviceId)
      }))
    );

    return NextResponse.json({
      success: true,
      waitlists: waitlistsWithPosition,
      count: activeWaitlists.length
    });

  } catch (error) {
    console.error('Error fetching waitlist status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch waitlist status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Remove from waitlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const waitlistId = searchParams.get('id');

    if (!waitlistId) {
      return NextResponse.json(
        { error: 'Waitlist ID required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update waitlist status to cancelled
    const updatedWaitlist = await prisma.waitlist.updateMany({
      where: {
        id: waitlistId,
        userId: user.id // Ensure user can only cancel their own waitlist entries
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      }
    });

    if (updatedWaitlist.count === 0) {
      return NextResponse.json(
        { error: 'Waitlist entry not found or already cancelled' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully removed from waitlist'
    });

  } catch (error) {
    console.error('Error removing from waitlist:', error);
    return NextResponse.json(
      { 
        error: 'Failed to remove from waitlist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions
async function getWaitlistPriority(userId: string): Promise<number> {
  // Higher priority for loyal customers, premium members, etc.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bookings: { where: { status: { not: 'CANCELLED' } } },
      membership: {
        include: {
          membershipPlan: true
        }
      }
    }
  });

  if (!user) return 1;

  let priority = 1;
  
  // Premium members get higher priority
  if (user.membership?.membershipPlan.name === 'PREMIUM') priority += 3;
  
  // Loyal customers (5+ bookings) get priority
  if (user.bookings.length >= 5) priority += 2;
  
  // Very loyal customers (10+ bookings) get even higher priority
  if (user.bookings.length >= 10) priority += 1;

  return priority;
}

async function getWaitlistPosition(waitlistId: string): Promise<number> {
  const waitlist = await prisma.waitlist.findUnique({
    where: { id: waitlistId }
  });

  if (!waitlist) return 0;

  const position = await prisma.waitlist.count({
    where: {
      preferredDate: waitlist.preferredDate,
      preferredTime: waitlist.preferredTime,
      serviceId: waitlist.serviceId,
      status: 'ACTIVE',
      OR: [
        { priority: { gt: waitlist.priority } },
        { 
          priority: waitlist.priority,
          createdAt: { lt: waitlist.createdAt }
        }
      ]
    }
  });

  return position + 1;
}

async function getServiceName(serviceId: string): Promise<string> {
  const serviceMapping: { [key: string]: string } = {
    'express': 'Express Exterior Wash',
    'premium': 'Premium Wash & Wax',
    'deluxe': 'Deluxe Interior & Exterior',
    'executive': 'Executive Detail Package'
  };

  return serviceMapping[serviceId] || 'Unknown Service';
}