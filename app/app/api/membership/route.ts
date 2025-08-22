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

    // Get membership plans (simplified to Basic and Premium)
    const membershipPlans = [
      {
        id: 'BASIC',
        name: 'Basic Member',
        description: 'Perfect for occasional car washes',
        price: 0, // FREE membership
        features: [
          '10% discount on all services',
          'Standard booking priority',
          '1x loyalty points',
          'Monthly newsletter',
          'Email customer support'
        ],
        popular: false
      },
      {
        id: 'PREMIUM',
        name: 'Premium Member',
        description: 'Great value for regular car care',
        price: 9900, // R99 per month in cents
        features: [
          '20% discount on all services',
          'Priority booking slots',
          '2x loyalty points earned',
          'Free tire shine monthly',
          'WhatsApp customer support',
          'Birthday month special discount',
          'Booking reminders via SMS'
        ],
        popular: true
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

    const planPrices = {
      BASIC: 0,
      PREMIUM: 9900
    };

    // Return payment options for users to choose payment method
    const payFastData = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: `${process.env.NEXTAUTH_URL}/membership/success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/membership/cancel`,
      notify_url: `${process.env.NEXTAUTH_URL}/api/membership/payfast-webhook`,
      name_first: user.firstName || 'Customer',
      name_last: user.lastName || '',
      email_address: user.email,
      amount: (planPrices[planId as keyof typeof planPrices] / 100).toFixed(2), // Convert cents to rands
      item_name: `${planId} Membership Subscription`,
      item_description: `Monthly ${planId.toLowerCase()} membership plan`,
      custom_str1: user.id, // User ID for tracking
      custom_str2: planId, // Plan ID for activation
      subscription_type: '1', // Recurring subscription
      recurring_amount: (planPrices[planId as keyof typeof planPrices] / 100).toFixed(2),
      frequency: '3', // Monthly
      cycles: '0' // Indefinite until cancelled
    };

    return NextResponse.json({
      requiresPaymentSelection: true,
      payFastData,
      planId,
      amount: planPrices[planId as keyof typeof planPrices],
      message: 'Choose your payment method for membership activation'
    });

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