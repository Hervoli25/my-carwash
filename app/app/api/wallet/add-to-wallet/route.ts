import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { WalletIntegration } from '@/lib/wallet-integration';

export const dynamic = "force-dynamic";

// POST - Generate wallet pass URL for user's membership
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { walletType } = await request.json();

    // Get user's membership data
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

    // Prepare membership data for wallet
    const membershipData = {
      membershipId: user.membership.id,
      memberName: user.name,
      memberEmail: user.email,
      membershipPlan: user.membership.membershipPlan.displayName,
      qrCode: user.membership.qrCode,
      discountRate: `${(user.membership.membershipPlan.discountRate * 100)}%`,
      loyaltyPoints: user.loyaltyPoints,
      memberSince: user.membership.startDate.toISOString().split('T')[0],
      validUntil: user.membership.endDate?.toISOString().split('T')[0] || null
    };

    // Generate wallet URL
    const walletIntegration = new WalletIntegration();
    const walletUrl = await walletIntegration.addToWallet(membershipData);

    return NextResponse.json({
      success: true,
      walletUrl,
      walletType: walletIntegration.detectWalletType(),
      membershipData
    });

  } catch (error) {
    console.error('💥 Wallet integration error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate wallet pass' 
    }, { status: 500 });
  }
}

// GET - Get wallet button data for user's device
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's membership data
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

    // Prepare membership data
    const membershipData = {
      membershipId: user.membership.id,
      memberName: user.name,
      membershipPlan: user.membership.membershipPlan.displayName,
      qrCode: user.membership.qrCode,
      discountRate: `${(user.membership.membershipPlan.discountRate * 100)}%`,
      loyaltyPoints: user.loyaltyPoints,
      memberSince: user.membership.startDate.toISOString().split('T')[0],
      validUntil: user.membership.endDate?.toISOString().split('T')[0] || null
    };

    // Get wallet button data based on device
    const walletIntegration = new WalletIntegration();
    const buttonData = walletIntegration.getWalletButtonData(membershipData);

    return NextResponse.json({
      success: true,
      buttonData,
      detectedWallet: walletIntegration.detectWalletType()
    });

  } catch (error) {
    console.error('💥 Wallet button data error:', error);
    return NextResponse.json({ 
      error: 'Failed to get wallet button data' 
    }, { status: 500 });
  }
}