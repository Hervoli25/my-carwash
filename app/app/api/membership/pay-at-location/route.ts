import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { randomBytes } from 'crypto';

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

    
    // Get plan details from database
    const selectedPlan = await prisma.membershipPlanConfig.findUnique({
      where: { name: planId }
    });

    if (!selectedPlan) {
      return NextResponse.json({ error: 'Invalid membership plan' }, { status: 400 });
    }

    // Generate unique QR code
    const qrCode = `EKHAYA-${user.id}-${randomBytes(8).toString('hex').toUpperCase()}`;

    const membershipData = {
      membershipPlanId: selectedPlan.id,
      qrCode: qrCode,
      startDate: new Date(),
      endDate: new Date(Date.now() + selectedPlan.duration * 24 * 60 * 60 * 1000),
      isActive: selectedPlan.price === 0, // Free plans are active immediately
      autoRenew: false, // Manual renewal for pay-at-location
      paymentMethod: selectedPlan.price === 0 ? 'free_tier' : 'pay_at_location'
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

    // Create a payment record for tracking (only for paid plans)
    if (selectedPlan.price > 0) {
      await prisma.payment.create({
        data: {
          amount: selectedPlan.price,
          status: 'PENDING',
          paymentMethodType: 'pay_at_location',
          stripePaymentIntentId: null,
          stripeCustomerId: null,
          currency: 'ZAR',
          description: `${selectedPlan.displayName} - Pay at Location`,
          paymentDate: null // Will be set when payment is received
        }
      });
    }

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
      qrCode: qrCode,
      message: selectedPlan.price === 0 
        ? `${selectedPlan.displayName} membership activated! Your free membership is ready to use.`
        : `${selectedPlan.displayName} membership created! Please visit our location to complete payment and activate your membership.`,
      paymentInstructions: selectedPlan.price > 0 ? {
        amount: `R${(selectedPlan.price / 100).toFixed(2)}`,
        plan: selectedPlan.displayName,
        membershipId: membership.id,
        instructions: 'Visit any of our locations to pay and activate your membership. Show your QR code for reference.'
      } : null
    });

  } catch (error) {
    console.error('💥 Pay at location membership error:', error);
    return NextResponse.json({ 
      error: 'Failed to create membership with pay at location option' 
    }, { status: 500 });
  }
}