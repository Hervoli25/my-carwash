import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Only allow this in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    // Disable 2FA for admin user for testing
    await prisma.adminUser.update({
      where: { username: 'admin' },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    });

    console.log('✅ 2FA disabled for admin user for testing');

    return NextResponse.json({
      success: true,
      message: '2FA disabled for admin user'
    });

  } catch (error) {
    console.error('❌ Error disabling 2FA:', error);
    return NextResponse.json({ 
      error: 'Failed to disable 2FA',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}