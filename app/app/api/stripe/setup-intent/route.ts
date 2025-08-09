import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { 
  createSetupIntent, 
  createStripeCustomer, 
  retrieveCustomer,
  listCustomerPaymentMethods,
  getPaymentMethodDetails 
} from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder_key_for_build') {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact administrator.' },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId: session.user.id },
    });

    let stripeCustomerId: string;

    if (!stripeCustomer) {
      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Create new Stripe customer
      const customer = await createStripeCustomer({
        email: user.email,
        name: user.name || undefined,
        phone: user.phone || undefined,
        metadata: {
          userId: session.user.id,
        },
      });

      // Save to database
      stripeCustomer = await prisma.stripeCustomer.create({
        data: {
          userId: session.user.id,
          stripeCustomerId: customer.id,
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
        },
      });

      stripeCustomerId = customer.id;
    } else {
      stripeCustomerId = stripeCustomer.stripeCustomerId;
    }

    // Create setup intent
    const setupIntent = await createSetupIntent({
      customerId: stripeCustomerId,
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      customerId: stripeCustomerId,
    });

  } catch (error) {
    console.error('Error creating setup intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get Stripe customer
    const stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId: session.user.id },
    });

    if (!stripeCustomer) {
      return NextResponse.json({
        paymentMethods: [],
      });
    }

    // Get payment methods from Stripe
    const stripePaymentMethods = await listCustomerPaymentMethods(
      stripeCustomer.stripeCustomerId
    );

    // Get existing payment methods from database
    const dbPaymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: session.user.id },
    });

    // Sync Stripe payment methods with database
    const syncedPaymentMethods = [];

    for (const stripePaymentMethod of stripePaymentMethods) {
      // Check if payment method exists in database
      let dbPaymentMethod = dbPaymentMethods.find(
        pm => pm.stripePaymentMethodId === stripePaymentMethod.id
      );

      const paymentMethodDetails = getPaymentMethodDetails(stripePaymentMethod);

      if (!dbPaymentMethod) {
        // Create new payment method in database
        dbPaymentMethod = await prisma.paymentMethod.create({
          data: {
            userId: session.user.id,
            type: paymentMethodDetails.type as any,
            lastFour: paymentMethodDetails.lastFour,
            expiryMonth: paymentMethodDetails.expiryMonth,
            expiryYear: paymentMethodDetails.expiryYear,
            cardholderName: stripePaymentMethod.billing_details.name || '',
            stripeBrand: paymentMethodDetails.brand,
            stripePaymentMethodId: stripePaymentMethod.id,
            stripeFingerprint: paymentMethodDetails.fingerprint,
            isDefault: false,
            isActive: true,
          },
        });
      } else {
        // Update existing payment method
        dbPaymentMethod = await prisma.paymentMethod.update({
          where: { id: dbPaymentMethod.id },
          data: {
            type: paymentMethodDetails.type as any,
            lastFour: paymentMethodDetails.lastFour,
            expiryMonth: paymentMethodDetails.expiryMonth,
            expiryYear: paymentMethodDetails.expiryYear,
            cardholderName: stripePaymentMethod.billing_details.name || dbPaymentMethod.cardholderName,
            stripeBrand: paymentMethodDetails.brand,
            stripeFingerprint: paymentMethodDetails.fingerprint,
            isActive: true,
          },
        });
      }

      syncedPaymentMethods.push({
        id: dbPaymentMethod.id,
        type: dbPaymentMethod.type,
        lastFour: dbPaymentMethod.lastFour,
        expiryMonth: dbPaymentMethod.expiryMonth,
        expiryYear: dbPaymentMethod.expiryYear,
        cardholderName: dbPaymentMethod.cardholderName,
        stripeBrand: dbPaymentMethod.stripeBrand,
        isDefault: dbPaymentMethod.isDefault,
        isActive: dbPaymentMethod.isActive,
        createdAt: dbPaymentMethod.createdAt,
      });
    }

    // Mark payment methods that are no longer in Stripe as inactive
    const stripePaymentMethodIds = stripePaymentMethods.map(pm => pm.id);
    const inactivePaymentMethods = dbPaymentMethods.filter(
      pm => pm.stripePaymentMethodId && !stripePaymentMethodIds.includes(pm.stripePaymentMethodId)
    );

    for (const inactivePaymentMethod of inactivePaymentMethods) {
      await prisma.paymentMethod.update({
        where: { id: inactivePaymentMethod.id },
        data: { isActive: false },
      });
    }

    return NextResponse.json({
      paymentMethods: syncedPaymentMethods,
    });

  } catch (error) {
    console.error('Error retrieving payment methods:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentMethodId, isDefault } = body;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Missing paymentMethodId' },
        { status: 400 }
      );
    }

    // Verify payment method belongs to user
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        userId: session.user.id,
      },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    if (isDefault !== undefined) {
      // If setting as default, unset all other default payment methods
      if (isDefault) {
        await prisma.paymentMethod.updateMany({
          where: {
            userId: session.user.id,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      // Update the payment method
      await prisma.paymentMethod.update({
        where: { id: paymentMethodId },
        data: { isDefault },
      });

      // Update Stripe customer default payment method if needed
      if (isDefault && paymentMethod.stripePaymentMethodId) {
        const stripeCustomer = await prisma.stripeCustomer.findUnique({
          where: { userId: session.user.id },
        });

        if (stripeCustomer) {
          await prisma.stripeCustomer.update({
            where: { id: stripeCustomer.id },
            data: {
              defaultPaymentMethodId: paymentMethod.stripePaymentMethodId,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
