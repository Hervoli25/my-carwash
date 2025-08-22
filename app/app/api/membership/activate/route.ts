import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// POST - Activate membership after successful payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentIntentId, planId } = await request.json();

    if (!paymentIntentId || !planId) {
      return NextResponse.json({ error: 'Missing payment intent or plan ID' }, { status: 400 });
    }

    // Verify payment with Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    let paymentIntent;

    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (stripeError) {
      console.error('💳 Stripe verification error:', stripeError);
      return NextResponse.json({ error: 'Failed to verify payment' }, { status: 400 });
    }

    // Ensure payment was successful
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ 
        error: 'Payment not completed',
        status: paymentIntent.status 
      }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { membership: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify payment belongs to this user
    if (paymentIntent.metadata.userId !== user.id) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 403 });
    }

    const planPrices = {
      BASIC: 0,
      PREMIUM: 9900,
      ELITE: 19900
    };

    const membershipData = {
      plan: planId,
      price: planPrices[planId as keyof typeof planPrices],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
      autoRenew: true
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

    // Create payment record
    await prisma.payment.create({
      data: {
        amount: paymentIntent.amount,
        status: 'COMPLETED',
        paymentMethodType: 'stripe_card',
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer as string,
        currency: 'ZAR',
        description: `${planId} Membership Subscription`,
        paymentDate: new Date()
      }
    });

    console.log('✅ Membership activated after payment:', {
      userId: user.id,
      email: user.email,
      plan: planId,
      paymentIntentId
    });

    return NextResponse.json({
      success: true,
      membership,
      message: `Welcome to your ${planId} membership! Payment successful.`
    });

  } catch (error) {
    console.error('💥 Membership activation error:', error);
    return NextResponse.json({ 
      error: 'Failed to activate membership' 
    }, { status: 500 });
  }
}