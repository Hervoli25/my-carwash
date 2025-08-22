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

    // Get membership plans from database
    const membershipPlans = await prisma.membershipPlanConfig.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    // Get user's current membership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        membership: {
          include: {
            membershipPlan: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      plans: membershipPlans.map(plan => ({
        id: plan.name,
        name: plan.displayName,
        description: plan.description,
        price: plan.price,
        features: plan.features,
        popular: plan.name === 'PREMIUM' // Mark Premium as popular
      })),
      currentMembership: user.membership ? {
        plan: user.membership.membershipPlan.name,
        planDisplayName: user.membership.membershipPlan.displayName,
        qrCode: user.membership.qrCode,
        isActive: user.membership.isActive,
        startDate: user.membership.startDate,
        endDate: user.membership.endDate,
        autoRenew: user.membership.autoRenew,
        price: user.membership.membershipPlan.price,
        features: user.membership.membershipPlan.features,
        discountRate: user.membership.membershipPlan.discountRate,
        paymentMethod: user.membership.paymentMethod
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

    // Get plan details from database
    const selectedPlan = await prisma.membershipPlanConfig.findUnique({
      where: { name: planId }
    });

    if (!selectedPlan || !selectedPlan.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive membership plan' }, { status: 400 });
    }

    // For free plans, directly create the membership
    if (selectedPlan.price === 0) {
      return NextResponse.json({
        requiresPayment: false,
        message: 'Basic membership is free! Your membership is already active.',
        plan: selectedPlan
      });
    }

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
      amount: (selectedPlan.price / 100).toFixed(2), // Convert cents to rands
      item_name: `${selectedPlan.displayName} Subscription`,
      item_description: `${selectedPlan.description}`,
      custom_str1: user.id, // User ID for tracking
      custom_str2: planId, // Plan ID for activation
      subscription_type: '1', // Recurring subscription
      recurring_amount: (selectedPlan.price / 100).toFixed(2),
      frequency: '3', // Monthly
      cycles: '0' // Indefinite until cancelled
    };

    return NextResponse.json({
      requiresPaymentSelection: true,
      payFastData,
      planId,
      amount: selectedPlan.price,
      plan: selectedPlan,
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