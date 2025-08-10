import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createPaymentIntent, createStripeCustomer, retrieveCustomer } from '@/lib/stripe';

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

    const body = await request.json();
    const { bookingId, amount, description } = body;

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, amount' },
        { status: 400 }
      );
    }

    // Get the booking to verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        service: true,
        vehicle: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to access this booking' },
        { status: 403 }
      );
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId },
    });

    if (existingPayment && existingPayment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment already completed for this booking' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId: session.user.id },
    });

    let stripeCustomerId: string;

    if (!stripeCustomer) {
      // Create new Stripe customer
      const customer = await createStripeCustomer({
        email: booking.user.email,
        name: booking.user.name || undefined,
        phone: booking.user.phone || undefined,
        metadata: {
          userId: session.user.id,
          bookingId: bookingId,
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
      
      // Update customer info if needed
      await retrieveCustomer(stripeCustomerId);
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount: amount,
      customerId: stripeCustomerId,
      description: description || `Payment for ${booking.service.name} - ${booking.vehicle.make} ${booking.vehicle.model}`,
      metadata: {
        bookingId: bookingId,
        userId: session.user.id,
        serviceId: booking.serviceId,
        vehicleId: booking.vehicleId,
      },
    });

    // Create or update payment record
    const paymentData = {
      bookingId: bookingId,
      amount: amount,
      status: 'PENDING' as const,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: stripeCustomerId,
      currency: 'ZAR',
      description: description || `Payment for ${booking.service.name}`,
    };

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: paymentData,
      });
    } else {
      await prisma.payment.create({
        data: paymentData,
      });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: stripeCustomerId,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
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

    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent_id');

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing payment_intent_id parameter' },
        { status: 400 }
      );
    }

    // Get payment from database
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntentId,
      },
      include: {
        booking: {
          include: {
            user: true,
            service: true,
            vehicle: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (!payment.booking) {
      return NextResponse.json(
        { error: 'Booking not found for this payment' },
        { status: 404 }
      );
    }

    if (payment.booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to access this payment' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        currency: payment.currency,
        description: payment.description,
        paymentDate: payment.paymentDate,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        booking: {
          id: payment.booking.id,
          bookingDate: payment.booking.bookingDate,
          timeSlot: payment.booking.timeSlot,
          service: {
            name: payment.booking.service.name,
            category: payment.booking.service.category,
          },
          vehicle: {
            make: payment.booking.vehicle.make,
            model: payment.booking.vehicle.model,
            licensePlate: payment.booking.vehicle.licensePlate,
          },
        },
      },
    });

  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
