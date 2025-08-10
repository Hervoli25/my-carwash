import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// GET - Fetch membership plans and user membership status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get membership plans
    const membershipPlans = [
      {
        id: 'BASIC',
        name: 'Basic Member',
        description: 'Perfect for occasional car washes',
        price: 4900, // R49 per month in cents
        features: [
          '10% discount on all services',
          'Standard booking priority',
          '1x loyalty points',
          'Monthly newsletter',
          'Basic customer support'
        ],
        popular: false
      },
      {
        id: 'PREMIUM',
        name: 'Premium Member',
        description: 'Great value for regular car care',
        price: 9900, // R99 per month in cents
        features: [
          '15% discount on all services',
          'Priority booking',
          '2x loyalty points',
          'Free tire shine monthly',
          'Premium customer support',
          'Birthday month discount'
        ],
        popular: true
      },
      {
        id: 'ELITE',
        name: 'Elite Member',
        description: 'Ultimate car care experience',
        price: 19900, // R199 per month in cents
        features: [
          '25% discount on all services',
          'VIP priority booking',
          '3x loyalty points',
          'Free add-ons (tire shine, air freshener)',
          'Monthly complimentary detailing',
          'Concierge customer support',
          'Exclusive member events'
        ],
        popular: false
      }
    ];

    // Get user's current membership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { membership: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      plans: membershipPlans,
      currentMembership: user.membership ? {
        plan: user.membership.plan,
        isActive: user.membership.isActive,
        startDate: user.membership.startDate,
        endDate: user.membership.endDate,
        autoRenew: user.membership.autoRenew,
        price: user.membership.price
      } : null,
      isAdmin: user.email === 'hervetshombe@gmail.com'
    });

  } catch (error) {
    console.error('💥 Membership API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST - Subscribe to a membership plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await request.json();

    if (!['BASIC', 'PREMIUM', 'ELITE'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid membership plan' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { membership: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Admin gets free membership
    const isAdmin = user.email === 'hervetshombe@gmail.com';
    
    const planPrices = {
      BASIC: 4900,
      PREMIUM: 9900,
      ELITE: 19900
    };

    // If user already has a membership, update it
    if (user.membership) {
      const updatedMembership = await prisma.membership.update({
        where: { id: user.membership.id },
        data: {
          plan: planId,
          price: isAdmin ? 0 : planPrices[planId as keyof typeof planPrices],
          isActive: true,
          startDate: new Date(),
          endDate: isAdmin ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          autoRenew: !isAdmin
        }
      });

      return NextResponse.json({ 
        success: true, 
        membership: updatedMembership,
        message: isAdmin ? 'Admin membership updated successfully!' : 'Membership upgraded successfully!'
      });
    } else {
      // Create new membership
      const newMembership = await prisma.membership.create({
        data: {
          userId: user.id,
          plan: planId,
          price: isAdmin ? 0 : planPrices[planId as keyof typeof planPrices],
          startDate: new Date(),
          endDate: isAdmin ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          isActive: true,
          autoRenew: !isAdmin
        }
      });

      return NextResponse.json({ 
        success: true, 
        membership: newMembership,
        message: isAdmin ? 'Admin membership activated successfully!' : 'Welcome to your new membership!'
      });
    }

  } catch (error) {
    console.error('💥 Membership subscription error:', error);
    return NextResponse.json({ 
      error: 'Failed to process membership subscription' 
    }, { status: 500 });
  }
}

// DELETE - Cancel membership
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { membership: true }
    });

    if (!user || !user.membership) {
      return NextResponse.json({ error: 'No active membership found' }, { status: 404 });
    }

    // Admin memberships cannot be cancelled this way
    const isAdmin = user.email === 'hervetshombe@gmail.com';
    if (isAdmin) {
      return NextResponse.json({ 
        error: 'Admin membership cannot be cancelled' 
      }, { status: 403 });
    }

    await prisma.membership.update({
      where: { id: user.membership.id },
      data: {
        isActive: false,
        autoRenew: false,
        endDate: new Date() // End immediately
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Membership cancelled successfully' 
    });

  } catch (error) {
    console.error('💥 Membership cancellation error:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel membership' 
    }, { status: 500 });
  }
}