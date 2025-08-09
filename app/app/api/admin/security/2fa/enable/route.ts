import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import speakeasy from 'speakeasy';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { verificationCode, saveBackupCodes } = await request.json();

    if (!verificationCode || verificationCode.length !== 6) {
      return NextResponse.json(
        { error: 'Valid 6-digit verification code required' },
        { status: 400 }
      );
    }

    // Get admin user with current 2FA secret
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: session.user.id }
    });

    if (!adminUser || !adminUser.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA setup not initialized. Please restart setup process.' },
        { status: 400 }
      );
    }

    // Verify the code with enterprise-grade validation
    const isValidToken = speakeasy.totp.verify({
      secret: adminUser.twoFactorSecret,
      token: verificationCode,
      window: 2, // Allow 2 time steps (±60 seconds)
      encoding: 'base32'
    });

    if (!isValidToken) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please check your authenticator app.' },
        { status: 400 }
      );
    }

    // Enable 2FA with enterprise security
    await prisma.adminUser.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: true,
        updatedAt: new Date(),
        // Reset security counters as 2FA is now active
        failedLogins: 0,
        lockedUntil: null
      }
    });

    // Log this critical security action
    console.log(`✅ 2FA enabled for admin user: ${session.user.username} (${session.user.id})`);

    return NextResponse.json({
      success: true,
      message: 'Enterprise 2FA successfully enabled',
      securityLevel: 'MAXIMUM',
      timestamp: new Date().toISOString(),
      user: {
        id: session.user.id,
        username: session.user.username,
        twoFactorEnabled: true,
        role: session.user.role
      }
    });

  } catch (error) {
    console.error('Professional 2FA enable error:', error);
    return NextResponse.json(
      { error: 'Failed to enable 2FA. Please contact system administrator.' },
      { status: 500 }
    );
  }
}

