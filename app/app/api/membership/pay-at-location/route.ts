import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// POST - Activate membership with "Pay at Location" option
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await request.json();

    if (!['BASIC', 'PREMIUM'].includes(planId)) {
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
      PREMIUM: 9900
    };

    const membershipData = {
      plan: planId,
      price: isAdmin ? 0 : planPrices[planId as keyof typeof planPrices],
      startDate: new Date(),
      endDate: isAdmin ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: false, // Will be activated when payment is received at location
      autoRenew: false, // Manual renewal for pay-at-location
      paymentMethod: 'pay_at_location'
    };

    let membership;

    if (user.membership) {
      // Update existing membership
      membership = await prisma.membership.update({
        where: { id: user.membership.id },
        data: membershipData
      });
    } else {
      // Create new membership
      membership = await prisma.membership.create({
        data: {
          userId: user.id,
          ...membershipData
        }
      });
    }

    // Create a pending payment record for tracking
    await prisma.payment.create({
      data: {
        amount: membershipData.price,
        status: 'PENDING',
        paymentMethodType: 'pay_at_location',
        stripePaymentIntentId: null,
        stripeCustomerId: null,
        currency: 'ZAR',
        description: `${planId} Membership - Pay at Location`,
        paymentDate: null // Will be set when payment is received
      }
    });

    console.log('💰 Membership created with Pay at Location option:', {
      userId: user.id,
      email: user.email,
      plan: planId,
      membershipId: membership.id,
      paymentMethod: 'pay_at_location'
    });

    return NextResponse.json({
      success: true,
      membership,
      message: `${planId} membership created! Please visit our location to complete payment and activate your membership.`,
      paymentInstructions: {
        amount: `R${(membershipData.price / 100).toFixed(2)}`,
        plan: planId,
        membershipId: membership.id,
        instructions: 'Visit any of our locations to pay and activate your membership. Bring your membership ID for reference.'
      }
    });

  } catch (error) {
    console.error('💥 Pay at location membership error:', error);
    return NextResponse.json({ 
      error: 'Failed to create membership with pay at location option' 
    }, { status: 500 });
  }
}