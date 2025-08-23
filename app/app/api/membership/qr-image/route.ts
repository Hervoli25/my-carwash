import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import QRCode from 'qrcode';

export const dynamic = "force-dynamic";

// GET - Generate QR code image for user's membership
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

    // Generate QR code as base64 data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrDataString, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    // Also generate as buffer for download
    const qrCodeBuffer = await QRCode.toBuffer(qrDataString, {
      width: 400,
      margin: 3,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    if (format === 'image') {
      // Return as PNG image
      return new NextResponse(qrCodeBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `inline; filename="membership-qr-${user.membership.qrCode}.png"`,
          'Cache-Control': 'public, max-age=3600'
        },
      });
    }

    // Return as JSON with data URL
    return NextResponse.json({
      success: true,
      qrCodeDataURL,
      qrCodeText: user.membership.qrCode,
      membershipData: {
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
    console.error('💥 QR code image generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate QR code image' 
    }, { status: 500 });
  }
}