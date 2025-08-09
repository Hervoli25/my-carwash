import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import speakeasy from 'speakeasy';
import crypto from 'crypto';

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

    // Generate enterprise-grade 2FA secret
    const secret = speakeasy.generateSecret({
      name: `Ekhaya Car Wash Admin (${session.user.username})`,
      issuer: 'Ekhaya Car Wash - Admin Portal',
      length: 32 // 256-bit entropy
    });

    // Generate secure backup codes
    const backupCodes = Array.from({ length: 10 }, () => {
      return crypto.randomBytes(4).toString('hex').toUpperCase();
    });

    // Store the secret temporarily (will be enabled after verification)
    await prisma.adminUser.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: secret.base32,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url,
      backupCodes: backupCodes,
      issuer: 'Ekhaya Car Wash',
      accountName: `${session.user.username}@ekhayaintel.co.za`
    });

  } catch (error) {
    console.error('Professional 2FA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize enterprise 2FA setup' },
      { status: 500 }
    );
  }
}

