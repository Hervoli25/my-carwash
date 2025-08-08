import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Received Stripe webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing payment_intent.succeeded:', paymentIntent.id);

    // Find the payment in our database
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      console.error('Payment not found for PaymentIntent:', paymentIntent.id);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        paymentDate: new Date(),
        stripeChargeId: paymentIntent.latest_charge as string,
        stripeFee: paymentIntent.application_fee_amount || 0,
        transactionId: paymentIntent.id,
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: 'CONFIRMED',
      },
    });

    // Create notification for successful payment
    await prisma.notification.create({
      data: {
        userId: payment.booking.userId,
        title: 'Payment Successful',
        message: `Your payment of ${formatAmount(payment.amount)} has been processed successfully.`,
        type: 'PAYMENT',
      },
    });

    console.log('Payment processed successfully:', payment.id);

  } catch (error) {
    console.error('Error handling payment_intent.succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing payment_intent.payment_failed:', paymentIntent.id);

    // Find the payment in our database
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      console.error('Payment not found for PaymentIntent:', paymentIntent.id);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      },
    });

    // Create notification for failed payment
    await prisma.notification.create({
      data: {
        userId: payment.booking.userId,
        title: 'Payment Failed',
        message: `Your payment of ${formatAmount(payment.amount)} could not be processed. Please try again.`,
        type: 'PAYMENT',
      },
    });

    console.log('Payment failure processed:', payment.id);

  } catch (error) {
    console.error('Error handling payment_intent.payment_failed:', error);
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing payment_intent.canceled:', paymentIntent.id);

    // Find the payment in our database
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      console.error('Payment not found for PaymentIntent:', paymentIntent.id);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CANCELLED',
      },
    });

    // Create notification for canceled payment
    await prisma.notification.create({
      data: {
        userId: payment.booking.userId,
        title: 'Payment Canceled',
        message: `Your payment of ${formatAmount(payment.amount)} has been canceled.`,
        type: 'PAYMENT',
      },
    });

    console.log('Payment cancellation processed:', payment.id);

  } catch (error) {
    console.error('Error handling payment_intent.canceled:', error);
  }
}

async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  try {
    console.log('Processing charge.dispute.created:', dispute.id);

    // Find the payment associated with this charge
    const payment = await prisma.payment.findFirst({
      where: {
        stripeChargeId: dispute.charge as string,
      },
      include: {
        booking: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!payment) {
      console.error('Payment not found for dispute:', dispute.id);
      return;
    }

    // Create notification for dispute
    await prisma.notification.create({
      data: {
        userId: payment.booking.userId,
        title: 'Payment Dispute',
        message: `A dispute has been created for your payment of ${formatAmount(payment.amount)}. We will review this matter.`,
        type: 'SYSTEM',
      },
    });

    // You might want to create a separate disputes table to track these
    console.log('Dispute notification created for payment:', payment.id);

  } catch (error) {
    console.error('Error handling charge.dispute.created:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Processing invoice.payment_succeeded:', invoice.id);
    
    // Handle subscription payments if you implement memberships
    if ((invoice as any).subscription) {
      // Update membership status
      const membership = await prisma.membership.findFirst({
        where: {
          // You'd need to store the subscription ID in your membership table
          // subscriptionId: invoice.subscription as string,
        },
      });

      if (membership) {
        await prisma.membership.update({
          where: { id: membership.id },
          data: {
            isActive: true,
            // Update end date based on billing cycle
          },
        });
      }
    }

  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('Processing customer.subscription.deleted:', subscription.id);
    
    // Handle subscription cancellation
    const membership = await prisma.membership.findFirst({
      where: {
        // You'd need to store the subscription ID in your membership table
        // subscriptionId: subscription.id,
      },
    });

    if (membership) {
      await prisma.membership.update({
        where: { id: membership.id },
        data: {
          isActive: false,
          endDate: new Date(),
        },
      });
    }

  } catch (error) {
    console.error('Error handling customer.subscription.deleted:', error);
  }
}

// Helper function to format amount for display
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount / 100);
}
