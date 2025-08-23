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

    // QR code data in readable format
    const validFrom = new Date(user.membership.startDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    const validTo = user.membership.endDate 
      ? new Date(user.membership.endDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      : 'Lifetime';

    const qrDataString = `${user.membership.qrCode}
${user.name} | ${user.membership.membershipPlan.displayName}
Valid: ${validFrom} - ${validTo}
Discount: ${(user.membership.membershipPlan.discountRate * 100)}% | Points: ${user.loyaltyPoints}
${user.phone || 'No phone'} | ${user.email}
Status: ${user.membership.isActive ? 'ACTIVE' : 'INACTIVE'}`;

    return NextResponse.json({
      success: true,
      qrData: qrDataString, // This will be encoded in the QR code
      displayData: {
        qrCode: user.membership.qrCode,
        memberName: user.name,
        membershipPlan: user.membership.membershipPlan.displayName,
        memberSince: user.membership.startDate,
        loyaltyPoints: user.loyaltyPoints,
        discountRate: `${(user.membership.membershipPlan.discountRate * 100)}%`,
        isActive: user.membership.isActive,
        validUntil: user.membership.endDate,
        validFrom: validFrom,
        validTo: validTo
      }
    });

  } catch (error) {
    console.error('💥 QR code generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate QR code data' 
    }, { status: 500 });
  }
}