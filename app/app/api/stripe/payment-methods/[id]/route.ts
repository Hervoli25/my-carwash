import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const paymentMethodId = params.id;

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

    // Don't allow deletion of default payment method if there are others
    if (paymentMethod.isDefault) {
      const otherMethods = await prisma.paymentMethod.count({
        where: {
          userId: session.user.id,
          id: { not: paymentMethodId },
          isActive: true,
        },
      });

      if (otherMethods > 0) {
        return NextResponse.json(
          { error: 'Cannot delete default payment method. Please set another method as default first.' },
          { status: 400 }
        );
      }
    }

    // Detach from Stripe if it's a Stripe payment method
    if (paymentMethod.stripePaymentMethodId) {
      try {
        await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);
      } catch (stripeError) {
        console.error('Error detaching payment method from Stripe:', stripeError);
        // Continue with database deletion even if Stripe detach fails
      }
    }

    // Delete from database
    await prisma.paymentMethod.delete({
      where: { id: paymentMethodId },
    });

    return NextResponse.json({
      message: 'Payment method deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
