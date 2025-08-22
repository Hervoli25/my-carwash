import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// GET - Generate QR code data for user's membership
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    if (!user || !user.membership) {
      return NextResponse.json({ error: 'No active membership found' }, { status: 404 });
    }

    // QR code data that can be scanned at the car wash location
    const qrData = {
      membershipId: user.membership.id,
      qrCode: user.membership.qrCode,
      userId: user.id,
      memberName: user.name,
      email: user.email,
      phone: user.phone,
      membershipPlan: user.membership.membershipPlan.name,
      planDisplayName: user.membership.membershipPlan.displayName,
      discountRate: user.membership.membershipPlan.discountRate,
      loyaltyPoints: user.loyaltyPoints,
      memberSince: user.membership.startDate,
      isActive: user.membership.isActive,
      validUntil: user.membership.endDate
    };

    return NextResponse.json({
      success: true,
      qrData: JSON.stringify(qrData), // This will be encoded in the QR code
      displayData: {
        qrCode: user.membership.qrCode,
        memberName: user.name,
        membershipPlan: user.membership.membershipPlan.displayName,
        memberSince: user.membership.startDate,
        loyaltyPoints: user.loyaltyPoints,
        discountRate: `${(user.membership.membershipPlan.discountRate * 100)}%`,
        isActive: user.membership.isActive,
        validUntil: user.membership.endDate
      }
    });

  } catch (error) {
    console.error('💥 QR code generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate QR code data' 
    }, { status: 500 });
  }
}