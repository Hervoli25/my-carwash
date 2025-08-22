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

    // QR code data that will be encoded
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
      validUntil: user.membership.endDate,
      generatedAt: new Date().toISOString()
    };

    // Generate QR code as base64 data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    // Also generate as buffer for download
    const qrCodeBuffer = await QRCode.toBuffer(JSON.stringify(qrData), {
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